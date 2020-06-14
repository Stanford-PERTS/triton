"""Test user methods."""

import logging

from cron_handlers import ReleasePreviews
from model import Classroom, Notification, Program, Report, Team, User
from unit_test_helper import ConsistencyTestCase
import MySQLdb
import mysql_connection
import util


class TestReports(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestReports, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
                'notification': Notification.get_table_definition(),
                'program': Program.get_table_definition(),
                'report': Report.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        self.program = Program.create(
            name="Engagement Project",
            label='ep18',
            min_cycles=3,
            active=True,
            preview_url='foo.com',
        )
        self.program.put()

    def test_parent_id(self):
        """Type should be filled automatically based on classroom_id."""
        org_id = 'Organization_foo'
        team_id = 'Team_foo'
        classroom_id = 'Classroom_foo'

        org_report = Report.create(organization_id=org_id)
        self.assertEqual(org_report.parent_id, org_id)
        self.assertEqual(org_report.organization_id, org_id)

        team_report = Report.create(team_id=team_id)
        self.assertEqual(team_report.parent_id, team_id)
        self.assertEqual(team_report.team_id, team_id)


        cl_report = Report.create(team_id=team_id, classroom_id=classroom_id)
        self.assertEqual(cl_report.parent_id, classroom_id)
        self.assertEqual(cl_report.team_id, team_id)
        self.assertEqual(cl_report.classroom_id, classroom_id)

    def test_unique_team_reports(self):
        kwargs = {
            'team_id': 'Team_foo',
            'filename': 'cool_report.html',
            'gcs_path': '/foo/path',
            'size': 1,
            'content_type': 'text/html',
        }

        first_report = Report.create(**kwargs)
        first_report.put()

        dup_report = Report.create(**kwargs)
        with self.assertRaises(MySQLdb.IntegrityError):
            dup_report.put()

    def test_unique_classroom_reports(self):
        kwargs = {
            'team_id': 'Team_foo',
            'classroom_id': 'Classroom_foo',
            'filename': 'cool_report.html',
            'gcs_path': '/foo/path',
            'size': 1,
            'content_type': 'text/html',
        }

        first_report = Report.create(**kwargs)
        first_report.put()

        dup_report = Report.create(**kwargs)
        with self.assertRaises(MySQLdb.IntegrityError):
            dup_report.put()

    def test_get_previews_unlimited(self):
        week='2019-09-30'
        num = 101  # more than default limit of 100

        many_reports = [
            Report.create(
                team_id='Team_foo',
                classroom_id='Classroom_{}'.format(x),
                filename='{}.html'.format(week),
                gcs_path='/mybucket/upload/{}.pdf'.format(x),
                size=1000000,
                content_type='text/html',
                preview=True,
            )
            for x in range(num)
        ]
        rows = [Report.coerce_row_dict(r.to_dict()) for r in many_reports]
        with mysql_connection.connect() as sql:
            sql.insert_row_dicts(Report.table, rows)

        preview_reports = Report.get_previews(week)
        self.assertEqual(len(preview_reports), num)

    def test_release_previews_bad_week(self):
        with self.assertRaises(Exception):
            Report.release_previews('evil code')

    def create(self):
        week='2019-02-25'
        captain = User.create(email="captain@perts.net")
        contact = User.create(email="contact@perts.net")
        member = User.create(email="member@perts.net")
        other = User.create(email="other@perts.net")

        team = Team.create(name="Team Foo", captain_id=captain.uid,
                           program_id=self.program.uid)
        team.put()

        classroom = Classroom.create(
            name="Class Foo",
            team_id=team.uid,
            contact_id=contact.uid,
            code="trout viper",
        )
        classroom.put()

        captain.owned_teams = [team.uid]
        contact.owned_teams = [team.uid]
        member.owned_teams = [team.uid]
        User.put_multi((captain, contact, member, other))

        previewTeamReport = Report.create(
            team_id=team.uid,
            filename='{}.html'.format(week),
            gcs_path='/mybucket/upload/12345.pdf',
            size=1000000,
            content_type='text/html',
            preview=True,
        )
        previewClassroomReport = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='{}.html'.format(week),
            gcs_path='/mybucket/upload/12345.pdf',
            size=1000000,
            content_type='text/html',
            preview=True,
        )
        normalReport = Report.create(
            team_id=team.uid,
            filename='2019-02-18.html',
            gcs_path='/mybucket/upload/09876.pdf',
            size=1000000,
            content_type='text/html',
            preview=False,
        )
        Report.put_multi((previewTeamReport, previewClassroomReport,
                          normalReport))

        return (week, captain, contact, member, other, team, classroom,
                previewTeamReport, previewClassroomReport, normalReport)

    def test_release_previews(self):
        (
            week, captain, contact, member, other, team, classroom,
            previewTeamReport, previewClassroomReport, normalReport
        ) = self.create()

        handler = ReleasePreviews()
        num_released = handler.release_and_notify(week)
        self.assertEqual(num_released, 2)

        fetched = Report.get_by_id((previewTeamReport.uid,
                                   previewClassroomReport.uid))
        self.assertEqual({r.preview for r in fetched}, {False, False})

        # Notifications should also have been sent, one about the team report
        # for the captain and team member, and both team and class reports for
        # the main contact. None for anyone else.
        self.assertEqual(len(Notification.get(user_id=captain.uid)), 1)
        self.assertEqual(len(Notification.get(user_id=member.uid)), 1)
        self.assertEqual(len(Notification.get(user_id=contact.uid)), 2)
        self.assertEqual(len(Notification.get(user_id=other.uid)), 0)

        # Releasing again for the same week should have no affect.
        num_released = handler.release_and_notify(week)
        self.assertEqual(num_released, 0)
        self.assertEqual(len(Notification.get()), 4)  # same as before

    def test_team_notifications_disabled(self):
        (
            week, captain, contact, member, other, team, classroom,
            previewTeamReport, previewClassroomReport, normalReport
        ) = self.create()

        team.report_reminders = False
        team.put()

        handler = ReleasePreviews()
        num_released = handler.release_and_notify(week)
        self.assertEqual(num_released, 2)

        # Notifications should NOT have been sent.
        self.assertEqual(len(Notification.get()), 0)

    def test_get_for_team(self):
        team_id = 'Team_foo'
        preview = False
        non_empty_template = 'ep_report'

        params = {
            'content_type': 'application/json',
            'filename': 'a',
            'preview': False,
            'team_id': team_id,
            'template': non_empty_template,
        }

        reports = [
            Report.create(**params),
            Report.create(**dict(params, classroom_id='Classroom_foo')),
            Report.create(**dict(params, filename='b', template='empty')),
        ]
        Report.put_multi(reports)

        # The empty report is not returned, but both team- and class-level are.
        fetched = Report.get_for_team(team_id, preview)
        self.assertEqual(len(fetched), 2)
        self.assertEqual(fetched[0].template, non_empty_template)
        self.assertEqual(fetched[1].template, non_empty_template)

    def test_get_for_organization(self):
        org_id = 'Organization_foo'
        preview = False
        non_empty_template = 'ep_report'

        params = {
            'content_type': 'application/json',
            'filename': 'a',
            'preview': False,
            'organization_id': org_id,
            'template': non_empty_template,
        }

        reports = [
            Report.create(**params),
            Report.create(**dict(params, filename='b', template='empty')),
        ]
        Report.put_multi(reports)

        # The empty report is not returned.
        fetched = Report.get_for_organization(org_id, preview)
        self.assertEqual(len(fetched), 1)
        self.assertEqual(fetched[0].template, non_empty_template)
