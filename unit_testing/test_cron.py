"""Test team methods."""

from google.appengine.api import memcache
from google.appengine.ext import testbed
import datetime
import json
import logging
import unittest
import urlparse
import webapp2
import webtest

from cron_handlers import cron_routes
from model import Classroom, Organization, Program, Report, Team, User
from unit_test_helper import ConsistencyTestCase
import cron_rserve
import mysql_connection
import util


class TestCron(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestCron, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
                'report': Report.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        application = webapp2.WSGIApplication(
            cron_routes,
            config={
                'webapp2_extras.sessions': {
                    'secret_key': 'foo'
                }
            },
            debug=True
        )
        self.testapp = webtest.TestApp(application)

        self.taskqueue_stub = self.testbed.get_stub(
            testbed.TASKQUEUE_SERVICE_NAME)

        self.ep_program = Program.create(
            name="Engagement Project",
            label='ep19',
            min_cycles=3,
            active=True,
            preview_url='foo.com',
        )
        self.ep_program.put()

        self.beleset_program = Program.create(
            name="Copilot Elevate",
            label='beleset19',
            send_cycle_email=False,
            preview_url='foo.com',
        )
        self.beleset_program.put()

    def test_cycle_email_task_queues(self):
        # Create a team that should get a cycle email.
        ep_team = Team.create(
            name="EP Team",
            program_id=self.ep_program.uid,
            captain_id='User_captain',
        )
        ep_team.put()

        # Initiate cycle emails.
        self.testapp.get('/cron/cycle_emails')

        # One emailing task queued.
        tasks = self.taskqueue_stub.get_filtered_tasks()
        self.assertEqual(len(tasks), 1)

    def test_cycle_email_task_does_not_queue(self):
        # Create a team that should NOT get a cycle email.
        beleset_team = Team.create(
            name="Elevate Team",
            program_id=self.beleset_program.uid,
            captain_id='User_captain',
        )
        beleset_team.put()

        # Initiate cycle emails.
        self.testapp.get('/cron/cycle_emails')

        # Zero emailing tasks queued.
        tasks = self.taskqueue_stub.get_filtered_tasks()
        self.assertEqual(len(tasks), 0)

    def test_rserve_credential(self):
        p = cron_rserve.get_fetch_params('ep', {'foo': 'payload'})
        self.assertIsInstance(p['url'], str)
        self.assertIsInstance(p['payload'], str)
        self.assertIsInstance(p['headers']['Authorization'], str)
        self.assertTrue(p['headers']['Authorization'].startswith('Bearer '))
        self.assertEqual(p['headers']['Content-Type'], 'application/json')
        logging.info(p['headers']['Authorization'])

    def test_rserve_payload(self):
        org = Organization.create(name='Org', program_id=self.ep_program.uid)
        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.ep_program.uid)
        classroom = Classroom.create(name='Classroom Bar', team_id=team.uid,
                                     contact_id='User_contact')
        # Orphaned classrooms shouldn't appear in the payload.
        other_classroom = Classroom.create(name='Classroom Other',
                                           team_id='Team_other',
                                           contact_id='User_other')

        payload = cron_rserve.build_payload(
            [org],
            [team],
            [classroom, other_classroom],
            {
                'neptune_sql_credentials': 'fake secret 1',
                'triton_sql_credentials': 'fake secret 2',
                'saturn_sql_credentials': 'fake secret 3',
                'qualtrics_credentials': 'fake secret 4',
                'mandrill_api_key': 'fake secret 5',
                'rserve_service_account_credentials': 'fake secret 6',
            },
        )

        self.assertIn('neptune_sql_credentials', payload)
        self.assertIn('triton_sql_credentials', payload)
        self.assertIn('saturn_sql_credentials', payload)
        self.assertIn('qualtrics_credentials', payload)
        self.assertIn('mandrill_api_key', payload)
        self.assertIn('rserve_service_account_credentials', payload)

        team_found = False
        classroom_found = False
        other_classroom_found = False
        for ru in payload['reporting_units']:
            if ru['id'] == org.uid and ru['organization_id'] == org.uid:
                org_found = True
            if ru['id'] == team.uid and ru['team_id'] == team.uid:
                team_found = True
            if (
                ru['id'] == classroom.uid and
                ru['classroom_id'] == classroom.uid and
                ru['team_id'] == team.uid
            ):
                classroom_found = True
            if ru['id'] == other_classroom.uid:
                other_classroom_found = True
        self.assertEqual(org_found, True)
        self.assertEqual(team_found, True)
        self.assertEqual(classroom_found, True)
        self.assertEqual(other_classroom_found, False)

    def test_rserve_skips_existing(self):
        program = Program.create(
            name="The Engagement Project",
            label="ep19",
            preview_url='foo.com',
        )
        week = util.datelike_to_iso_string(datetime.date.today())

        org = Organization.create(name="Organization", captain_id="User_cap",
                                  program_id=program.uid)
        org_to_skip = Organization.create(name="Organization", captain_id="User_cap",
                                          program_id=program.uid)
        Organization.put_multi([org, org_to_skip])

        team = Team.create(name="Team", captain_id="User_cap",
                           program_id=program.uid)
        team_to_skip = Team.create(name="Team", captain_id="User_cap",
                                   program_id=program.uid)
        Team.put_multi([team, team_to_skip])

        cl = Classroom.create(name="Classroom", team_id=team.uid,
                              code="foo", contact_id="User_contact")
        cl_to_skip = Classroom.create(name="Classroom", team_id=team.uid,
                                      code="foo", contact_id="User_contact")
        Classroom.put_multi([cl, cl_to_skip])

        Report.put_multi([
            Report.create(parent_id=org_to_skip.uid, filename="foo",
                          issue_date=week),
            Report.create(parent_id=team_to_skip.uid, filename="foo",
                          issue_date=week),
            Report.create(parent_id=cl_to_skip.uid, filename="foo",
                          issue_date=week),
        ])

        # Skips all the parents who have reports already this week.
        orgs, teams, classes = cron_rserve.get_report_parents(program, week,
                                                              False)
        self.assertEqual(len(orgs), 1)
        self.assertEqual(len(teams), 1)
        self.assertEqual(len(classes), 1)

        # ...unless you force it, then they're all there.
        orgs, teams, classes = cron_rserve.get_report_parents(program, week,
                                                              True)
        self.assertEqual(len(orgs), 2)
        self.assertEqual(len(teams), 2)
        self.assertEqual(len(classes), 2)

    def test_rserve_ru_override(self):
        """Can specify reporting unit ids to limit RServe request."""
        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.ep_program.uid)
        classroom1 = Classroom.create(name='Classroom One', team_id=team.uid,
                                      contact_id='User_contact', code='foo 1')
        classroom2 = Classroom.create(name='Classroom Two', team_id=team.uid,
                                      contact_id='User_contact', code='foo 2')
        classroom3 = Classroom.create(name='Classroom Three', team_id=team.uid,
                                      contact_id='User_contact', code='foo 3')
        team.put()
        Classroom.put_multi((classroom1, classroom2, classroom3))

        response = self.testapp.get(
            '/cron/rserve/reports/ep?ru={}&ru={}&really_send=false'
            .format(classroom1.uid, classroom2.uid)
        )
        payload = json.loads(response.body)['payload']

        # Only specified ids are present (class 1 and 2).
        self.assertEqual(
            set(ru['id'] for ru in payload['reporting_units']),
            {classroom1.uid, classroom2.uid},
        )

    def test_rserve_email_override(self):
        """Can request that emails are not sent."""
        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.ep_program.uid)
        team.put()

        response = self.testapp.get(
            '/cron/rserve/reports/ep?really_send=false&send_email=false'
        )
        payload = json.loads(response.body)['payload']

        # Only specified ids are present (class 1 and 2).
        self.assertNotIn('mandrill_api_key', payload)

    def test_ru_filtering(self):
        team_ep = Team.create(
            name='Team EP',
            captain_id='User_captain',
            program_id=self.ep_program.uid,
        )
        team_ep.put()
        classroom_ep = Classroom.create(
            name='Classroom EP',
            team_id=team_ep.uid,
            contact_id='User_contact',
            code='ep 1',
        )
        classroom_ep.put()

        # Only teams and classrooms for this program are present.
        response_ep = self.testapp.get(
            '/cron/rserve/reports/ep?really_send=false'
        )
        payload_ep = json.loads(response_ep.body)['payload']
        self.assertEqual(
            set((team_ep.uid, classroom_ep.uid)),
            set(ru['id'] for ru in payload_ep['reporting_units']),
        )

    def test_rserve_ep_url(self):
        response = self.testapp.get(
            '/cron/rserve/reports/ep?really_send=false'
        )
        url = json.loads(response.body)['url']
        scheme, netloc, path, query_string, fragment = urlparse.urlsplit(url)
        logging.info(path)
        self.assertEqual('/api/scripts/ep', path)
