"""Test survey methods."""

import datetime
import logging

from model import Cycle, Metric, Program, Survey, Team
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util


class TestSurveys(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestSurveys, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'cycle': Cycle.get_table_definition(),
                'metric': Metric.get_table_definition(),
                'program': Program.get_table_definition(),
                'survey': Survey.get_table_definition(),
                'team': Team.get_table_definition(),
            })

    def test_get_metrics(self):
        metric1 = Metric.create(name="Community of Helpers",
                                label='community_of_helpers')
        metric1.put()
        metric2 = Metric.create(name="Feedback for Growth",
                                label='feedback_for_growth')
        metric2.put()

        survey = Survey.create(team_id='Team_foo',
                               metrics=[metric1.uid, metric2.uid])
        self.assertEqual(set(survey.get_metrics()), {metric1, metric2})

    def test_get_empty_metrics(self):
        survey = Survey.create(team_id='Team_foo', metrics=[])
        self.assertEqual(survey.get_metrics(), [])

    def test_create_for_team(self):
        """Should populate only with metrics active by default."""
        metric1 = Metric.create(name="Community of Helpers",
                                label='community_of_helpers')
        metric1.put()
        metric2 = Metric.create(name="Feedback for Growth",
                                label='feedback_for_growth')
        metric2.put()

        program = Program.create(
            name = 'Test Program',
            label = 'test-program',
            metrics = [
                {'uid': metric1.uid, 'default_active': True},
                {'uid': metric2.uid, 'default_active': False},
            ],
            preview_url='foo.com',
        )
        program.put()

        team = Team.create(
            captain_id = 'User_captain',
            program_id = program.uid,
        )

        survey = Survey.create_for_team(team)
        self.assertEqual(survey.metrics, [metric1.uid])
        self.assertEqual(survey.open_responses, [metric1.uid])
        self.assertEqual(survey.meta, {})

    def test_should_notify(self):
        team_id = 'Team_foo'
        survey = Survey.create(team_id=team_id)

        cycle = Cycle.create(
            team_id=team_id,
            ordinal=1,
            start_date=datetime.date.today() - datetime.timedelta(days=1),
            end_date=datetime.date.today() + datetime.timedelta(days=1),
        )
        cycle.put()

        today = datetime.date.today()
        now = datetime.datetime.now()

        # Case 1: notified time is not set.
        self.assertEqual(survey.should_notify(today), cycle)

        # Case 2: sent within cycle
        survey.notified = now - datetime.timedelta(days=1)
        self.assertEqual(survey.should_notify(today), False)

        # Case 3: sent before cycle
        survey.notified = now - datetime.timedelta(days=10)
        self.assertEqual(survey.should_notify(today), cycle)

        # import pdb
        # pdb.set_trace()
        # Case 4: today is not in any cycle (there is no current cycle)
        self.assertEqual(
            survey.should_notify(today - datetime.timedelta(days=10)),
            False,
        )

    def test_config_enabled(self):
        program = Program.create(
            name='Program Foo',
            label='TP1',
            survey_config_enabled=True,
            preview_url='foo.com',
        )
        program.put()

        team = Team.create(captain_id='User_captain', program_id=program.uid)
        team.put()

        survey = Survey.create(team_id=team.uid)
        survey.put()

        # Enabled by program.
        self.assertEqual(Survey.config_enabled(survey.uid), True)

        # Disabled by program.
        program.survey_config_enabled = False
        program.put()
        self.assertEqual(Survey.config_enabled(survey.uid), False)
