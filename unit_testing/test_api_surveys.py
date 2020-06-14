"""Tests endpoint /api/surveys and /api/teams/X/survey.

Indirectly tests RelatedQuery with SqlModel. Other suites may skip handlers
naively inherit from the same code.
"""

import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Email, Metric, Program, Survey, Team, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiSurveys(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    ep_program = None

    # To read queued emails immediately.
    consistency_probability = 1

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiSurveys, self).set_up()

        application = webapp2.WSGIApplication(
            api_routes,
            config={
                'webapp2_extras.sessions': {
                    'secret_key': self.cookie_key
                }
            },
            debug=True
        )
        self.testapp = webtest.TestApp(application)

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
                'metric': Metric.get_table_definition(),
                'program': Program.get_table_definition(),
                'survey': Survey.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        self.ep_program = Program.create(
            name="Engagement Project",
            label='ep18',
            active=True,
            preview_url='foo.com',
        )
        self.ep_program.put()

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def test_create_team_creates_survey(self):
        """When a team is created, its survey is automatically created."""
        user = User.create(name='User Foo', email='user@foo.com')
        user.put()

        code = 'trout viper'

        team_response = self.testapp.post_json(
            '/api/teams',
            {
                'name': 'Team Foo',
                'code': code,
                'program_id': self.ep_program.uid,
            },
            headers=self.login_headers(user),
        )
        team_dict = json.loads(team_response.body)

        survey_result = Survey.get(team_id=team_dict['uid'])
        self.assertEqual(len(survey_result), 1)
        survey = survey_result[0]

        return user, team_dict

    def test_all_metrics_on_by_default(self):
        metric1 = Metric.create(name='Metric One', label='m1')
        metric2 = Metric.create(name='Metric One', label='m2')
        Metric.put_multi([metric1, metric2])

        survey = Survey.create(team_id='Team_foo', code='trout viper')
        self.assertEqual(set(survey.metrics), {metric1.uid, metric2.uid})

    def test_post_not_implemented(self):
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        self.testapp.post_json(
            '/api/surveys',
            {},
            headers=self.login_headers(user),
            status=405,
        )

    def test_delete_not_implemented(self):
        user, team_dict = self.test_create_team_creates_survey()
        survey = Survey.get(team_id=team_dict['uid'])[0]
        self.testapp.delete(
            '/api/surveys/{}'.format(survey.uid),
            headers=self.login_headers(user),
            status=405,
        )

    def test_get_for_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/survey',
            status=401,
        )

    def test_get_for_team(self):
        """You can get the survey for a team you own."""
        user, team_dict = self.test_create_team_creates_survey()
        response = self.testapp.get(
            '/api/teams/{}/survey'.format(team_dict['uid']),
            headers=self.login_headers(user),
        )
        survey_dict = json.loads(response.body)
        self.assertTrue(survey_dict['uid'].startswith('Survey'))

    def test_get_for_other_forbidden(self):
        """You can't get a survey for someone else's team."""
        user, team_dict = self.test_create_team_creates_survey()
        other = User.create(name='Other', email='other@foo.com')
        other.put()
        self.testapp.get(
            '/api/teams/{}/survey'.format(team_dict['uid']),
            headers=self.login_headers(other),
            status=403,
        )

    def test_change_team_ignored(self):
        team_id = 'Team_foo'
        survey = Survey.create(team_id=team_id)
        survey.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team_id])
        user.put()
        response = self.testapp.put_json(
            '/api/surveys/{}'.format(survey.uid),
            {'team_id': 'Team_other'},
            headers=self.login_headers(user),
        )

        # team id shoud be unchanged
        self.assertEqual(json.loads(response.body)['team_id'], team_id)

    def test_put_issues_allowed_endpoints_jwt(self):
        """PUT response has special jwt giving permission on Neptune."""
        team_id = 'Team_foo'
        survey = Survey.create(team_id=team_id)
        survey.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team_id])
        user.put()
        # Add some classrooms
        c1 = Classroom.create(name='C1', team_id=team_id, code='a a',
                              contact_id='User_contact')
        c2 = Classroom.create(name='C2', team_id=team_id, code='b b',
                              contact_id='User_contact')
        Classroom.put_multi([c1, c2])

        response = self.testapp.put_json(
            '/api/surveys/{}'.format(survey.uid),
            {'metrics': ['Metric_001', 'Metric_002']},
            headers=self.login_headers(user),
        )

        jwt = response.headers['Authorization'][7:]  # drop "Bearer "
        payload, error = jwt_helper.decode(jwt)
        # Should include an endpoint for each classroom.
        self.assertEqual(
            set(payload['allowed_endpoints']),
            {
                'PUT //neptune/api/codes/a-a',
                'PUT //neptune/api/codes/b-b',
            },
        )

    def test_put_artifact_url_sends_email(self):
        """PUT response has special jwt giving permission on Neptune."""
        user = User.create(name='foo', email='foo@bar.com')
        team = Team.create(name="Foo Team", captain_id=user.uid,
                           program_id="Program_foo")
        survey = Survey.create(team_id=team.uid)
        user.owned_teams = [team.uid]

        team.put()
        survey.put()
        user.put()

        artifact_url = 'https://www.example.com/artifact'

        # Not changing the artifact does NOT trigger an email.
        self.testapp.put_json(
            '/api/surveys/{}'.format(survey.uid),
            {'meta': {'artifact_url': ''}},
            headers=self.login_headers(user),
        )
        self.assertEqual(Email.count(), 0)

        # Changing it triggers an email.
        self.testapp.put_json(
            '/api/surveys/{}'.format(survey.uid),
            {'meta': {'artifact_use': 'true', 'artifact_url': artifact_url}},
            headers=self.login_headers(user),
        )

        emails = Email.get()
        self.assertEqual(len(emails), 1)
        email = emails[0]
        self.assertIn(artifact_url, email.html)
        self.assertIn(team.name, email.html)

        # Sending a PUT **without** changing it does NOT trigger an email.
        self.testapp.put_json(
            '/api/surveys/{}'.format(survey.uid),
            {'meta': {'artifact_use': 'true', 'artifact_url': artifact_url}},
            headers=self.login_headers(user),
        )

        self.assertEqual(Email.count(), 1)  # same as before


    def test_metric_labels(self):
        """Client dict should have portal-friendly metric labels."""
        team_id = 'Team_foo'
        m1 = Metric.create(name='Foo Condition', label='foo_condition')
        m2 = Metric.create(name='Bar Condition', label='bar_condition')
        Metric.put_multi([m1, m2])
        survey = Survey.create(team_id=team_id, metrics=[m1.uid, m2.uid])
        survey.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team_id])
        user.put()
        response = self.testapp.get(
            '/api/surveys/{}'.format(survey.uid),
            headers=self.login_headers(user),
        )

        logging.info(response.body)
        self.assertEqual(
            json.loads(response.body)['metric_labels'],
            {m1.uid: 'foo_condition', m2.uid: 'bar_condition'},
        )
