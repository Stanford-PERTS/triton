"""Test task handlers."""

from google.appengine.api import urlfetch
from mock import patch
import codecs
import datetime
import json
import logging
import sys
import urlparse

from model import (Classroom, Cycle, Email, Metric, Program, Response, Survey,
                   Team, User)
from unit_test_helper import ConsistencyTestCase
import config
import mysql_connection
import task_handlers


class TestTasks(ConsistencyTestCase):

    # This tests one of the only datastore entities in triton: Email. We're
    # not worried about eventual consistency because the email cron job runs
    # every minute and will eventually find it.
    consistency_probability = 1

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestTasks, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
                'cycle': Cycle.get_table_definition(),
                'metric': Metric.get_table_definition(),
                'program': Program.get_table_definition(),
                'response': Response.get_table_definition(),
                'survey': Survey.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

    def create(self, program_label):
        program = Program.create(
            name="Foo",
            label=program_label,
            active=True,
            preview_url='foo.com',
        )
        program.put()

        captain = User.create(email='cap@perts.net', name="Captain PERTS")

        team = Team.create(name='Team Foo', program_id=program.uid,
                           captain_id=captain.uid)
        team.put()

        classrooms = [
            Classroom.create(name='Class A', team_id=team.uid, num_students=5,
                             contact_id='User_contact', code='foo'),
            Classroom.create(name='Class B', team_id=team.uid, num_students=5,
                             contact_id='User_contact', code='bar'),
            Classroom.create(name='Class C', team_id=team.uid, num_students=5,
                             contact_id='User_contact', code='baz'),
        ]
        Classroom.put_multi(classrooms)

        survey = Survey.create(team_id=team.uid)
        survey.put()

        captain.owned_teams = [team.uid]
        captain.put()

        start_date = datetime.date.today() - datetime.timedelta(days=7)
        end_date   = datetime.date.today() + datetime.timedelta(days=7)
        cycle = Cycle.create(team_id=team.uid, ordinal=1,
                             start_date=start_date, end_date=end_date)
        cycle.put()


        return (program, captain, team, classrooms, cycle)


    def test_participation_query(self):
        program, captain, team, classrooms, cycle = self.create('ep19')


        url = task_handlers.participation_query_url(cycle, classrooms)
        scheme, netloc, path, query_string, fragment = urlparse.urlsplit(url)
        self.assertEqual(path, '/api/project_cohorts/participation')
        query_params = urlparse.parse_qs(query_string)  # all fields as lists
        self.assertEqual(
            set(query_params['uid']),
            set(c.code for c in classrooms),
        )
        self.assertEqual(
            query_params['start'][0],
            cycle.start_date.strftime(config.iso_datetime_format),
        )
        self.assertEqual(
            query_params['end'][0],
            cycle.end_date.strftime(config.iso_datetime_format),
        )

    def test_sends_correct_email_for_ep(self, *args):
        # Note that what this handler should do if there isn't a current cycle
        # is tested in test_surveys.TestSurveys.test_should_notify
        program, captain, team, classrooms, cycle = self.create('ep19')

        # Mock Neptune's participation API.

        class MockFetchResult(object):
            status_code = 200
            content = r'{}'

        with patch.object(
            urlfetch, 'fetch', return_value=MockFetchResult()
        ) as _:
            handler = task_handlers.TeamCycleEmails()
            # Run the task.
            handler.post(team.uid)

        emails = Email.get()
        self.assertEqual(len(emails), 1)
        self.assertIn('ep19-cycle-progress-email', emails[0].html)

    def test_team_participation(self):
        program, captain, team, classrooms, cycle = self.create('ep19')

        # Mock Neptune's participation API.

        class MockFetchResult(object):
            status_code = 200
            content = json.dumps({
                c.code: [{'value': '100', 'n': 3}] for c in classrooms
            })

        with patch.object(
            urlfetch, 'fetch', return_value=MockFetchResult()
        ) as _:
            handler = task_handlers.TeamParticipation()
            # Run the task.
            handler.post(team.uid)

        # The cycle should show 3 * 3 = 9 students complete
        self.assertEqual(Cycle.get_by_id(cycle.uid).students_completed, 9)
