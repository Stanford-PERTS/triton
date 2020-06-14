"""Tests /api/responses[/:id] and /api/teams/:team_id/responses[/:id]"""

import datetime
import json
import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Cycle, Organization, Program, Response, Team, User
from unit_test_helper import ConsistencyTestCase, jwt_headers
import config
import mysql_connection


class TestApiResponses(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def default_body(self):
        return {
            'question': {'value': 'secret', 'modified': '2019-01-01T00:00:00Z'}
        }

    def body_values_match(self, body1, body2):
        def to_map(b):
            return {k: b[k]['value'] for k in b.keys()}

        return to_map(body1) == to_map(body2)

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiResponses, self).set_up()

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
                'cycle': Cycle.get_table_definition(),
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
                'response': Response.get_table_definition(),
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

    def create(self):
        org = Organization.create(name='Foo Community',
                                  program_id=self.program.uid)
        org.put()
        team = Team.create(
            name='foo',
            captain_id='User_captain',
            program_id=self.program.uid,
            organization_ids=[org.uid],
        )
        teammate = User.create(name='teammate', email='mate@team.com',
                               owned_teams=[team.uid])
        other = User.create(name='other', email='other@else.com')
        User.put_multi((other, teammate))
        team.put()

        cycles = (
            Cycle.create(
                team_id=team.uid,
                ordinal=1,
                start_date=datetime.date(2000, 1, 1),
                end_date=datetime.date(2000, 2, 1),
            ),
            Cycle.create(
                team_id=team.uid,
                ordinal=2,
                start_date=datetime.date.today(),
                end_date=datetime.date.today() + datetime.timedelta(weeks=4),
            ),
        )
        Cycle.put_multi(cycles)

        responses = {
            # User-level, not related to our team or user, inaccessible.
            'user_other_other': Response.create(
                user_id=other.uid,
                team_id='Team_other',
                parent_id='Cycle_other',
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
            # Related to our user but not our team.
            'user_other_user': Response.create(
                user_id=teammate.uid,
                team_id='Team_other',
                parent_id='Cycle_isolated',
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
            # Related to both our team and user; two different cycles.
            'user_team_user1': Response.create(
                user_id=teammate.uid,
                team_id=team.uid,
                parent_id=cycles[0].uid,
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
            'user_team_user2': Response.create(
                user_id=teammate.uid,
                team_id=team.uid,
                parent_id=cycles[1].uid,
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
            # Related to our team but not our user; body should stay secret
            'user_team_other': Response.create(
                user_id='User_other-teammate',
                team_id=team.uid,
                parent_id=cycles[0].uid,
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
            # Team-level response, readable for all team members
            'team_team': Response.create(
                type='Team',
                user_id='',
                team_id=team.uid,
                parent_id='launch-step',
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
            # Team-level, but for a different team.
            'team_other': Response.create(
                type='Team',
                user_id='',
                team_id='Team_other',
                parent_id='launch-step',
                module_label='ModuleFoo',
                body=self.default_body(),
            ),
        }
        Response.put_multi(responses.values())

        return (other, teammate, team, cycles, responses)

    def test_get_for_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/responses',
            status=401,
        )

    def test_get_for_team(self):
        """You can list responses for a team you own."""
        other, teammate, team, cycles, responses = self.create()

        # Forbidden for non-members.
        response = self.testapp.get(
            '/api/teams/{}/responses'.format(team.uid),
            headers=jwt_headers(other),
            status=403
        )

        # Successful for members.
        response = self.testapp.get(
            '/api/teams/{}/responses'.format(team.uid),
            headers=jwt_headers(teammate),
        )
        response_list = json.loads(response.body)

        def get_by_type(typ, response_list):
            return next(rd for rd in response_list if rd['uid'] == responses[typ].uid)

        # Responses from yourself or your team should have bodies.
        for typ in ('user_team_user1', 'user_team_user2', 'team_team'):
            self.assertEqual(
                get_by_type(typ, response_list)['body'],
                responses[typ].body,
            )

        # Responses from other users should be present but have empty bodies.
        self.assertEqual(
            get_by_type('user_team_other', response_list)['body'],
            {},
        )

        # Any responses from other teams should not be returned.
        self.assertEqual(len(response_list), 4)

        # Can filter by cycle.
        cycle_id = cycles[0].uid
        response = self.testapp.get(
            '/api/teams/{}/responses?parent_id={}'.format(team.uid, cycle_id),
            headers=jwt_headers(teammate),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 2)
        self.assertEqual(set(r['parent_id'] for r in response_list), {cycle_id})

    def test_get_for_team_supervisor(self):
        """What organization supervisors can see...

        * Full responses for team-level
        * No body for user-level
        """
        other, teammate, team, cycles, responses = self.create()

        supervisor = User.create(email='super@visor.com', name="Supervisor",
                                 owned_organizations=team.organization_ids)
        supervisor.put()

        response = self.testapp.get(
            '/api/teams/{}/responses'.format(team.uid),
            headers=jwt_headers(supervisor),
        )
        response_list = json.loads(response.body)

        for r in response_list:
            if r['type'] == Response.TEAM_LEVEL_SYMBOL:
                self.assertGreater(len(r['body']), 0)
            if r['type'] == Response.USER_LEVEL_SYMBOL:
                self.assertEqual(len(r['body']), 0)

    def test_get_for_team_super(self):
        """Super admins should be able to see full responses for anyone."""
        other, teammate, team, cycles, responses = self.create()

        admin = User.create(email='super@admin.com', name="Super",
                            user_type='super_admin')
        admin.put()
        response = self.testapp.get(
            '/api/teams/{}/responses'.format(team.uid),
            headers=jwt_headers(admin),
        )
        response_list = json.loads(response.body)

        for r in response_list:
            self.assertGreater(len(r['body']), 0)

    def test_get_requires_auth(self):
        self.testapp.get('/api/responses', status=401)

    def test_get(self):
        other, teammate, team, cycles, responses = self.create()

        # Forbidden to see all responses.
        response = self.testapp.get(
            '/api/responses',
            headers=jwt_headers(other),
            status=403,
        )

        # Forbidden to see other user's responses.
        response = self.testapp.get(
            '/api/responses/{}'.format(responses['user_team_other'].uid),
            headers=jwt_headers(other),
            status=403,
        )

        # Forbidden to see other team's responses.
        response = self.testapp.get(
            '/api/responses/{}'.format(responses['team_other'].uid),
            headers=jwt_headers(other),
            status=403,
        )

        # Success for own resposnes.
        user_resp = self.testapp.get(
            '/api/responses/{}'.format(responses['user_team_user1'].uid),
            headers=jwt_headers(teammate),
        )
        self.assertEqual(responses['user_team_user1'].uid,
                         json.loads(user_resp.body)['uid'])

        # Success for team resposnes.
        team_resp = self.testapp.get(
            '/api/responses/{}'.format(responses['team_team'].uid),
            headers=jwt_headers(teammate),
        )
        self.assertEqual(responses['team_team'].uid,
                         json.loads(team_resp.body)['uid'])

    def test_create(self):
        other, teammate, team, cycles, responses = self.create()

        # Can't choose non-existant parent.
        self.testapp.post_json(
            '/api/responses',
            {
                'team_id': team.uid,
                'parent_id': 'Cycle_dne',
                'module_label': 'ModuleFoo',
            },
            headers=jwt_headers(teammate),
            status=403,
        )

        # Can't choose an unowned parent.
        self.testapp.post_json(
            '/api/responses',
            {
                'team_id': team.uid,
                'parent_id': cycles[0].uid,
                'module_label': 'ModuleFoo',
            },
            headers=jwt_headers(other),
            status=403,
        )

        # Can't create duplicate responses.
        self.testapp.post_json(
            '/api/responses',
            {
                'team_id': team.uid,
                'parent_id': cycles[0].uid,
                'module_label': 'ModuleFoo',
                'user_id': teammate.uid,
            },
            headers=jwt_headers(teammate),
            status=409,
        )

        # Can't create responses for other people.
        self.testapp.post_json(
            '/api/responses',
            {
                'team_id': team.uid,
                'parent_id': cycles[0].uid,
                'module_label': 'ModuleFoo',
                'user_id': teammate.uid,
            },
            headers=jwt_headers(other),
            status=403,
        )

        # Success for own team, user-level, private.
        response = self.testapp.post_json(
            '/api/responses',
            {
                'user_id': teammate.uid,
                'team_id': team.uid,
                'parent_id': cycles[1].uid,
                'module_label': 'ModuleBar',
                'body': self.default_body(),
            },
            headers=jwt_headers(teammate),
        )
        user_fetched = Response.get_by_id(json.loads(response.body)['uid'])
        self.assertTrue(user_fetched.private)

        # Success for own team, user-level, public.
        response = self.testapp.post_json(
            '/api/responses',
            {
                'private': False,
                'user_id': teammate.uid,
                'team_id': team.uid,
                'parent_id': cycles[1].uid,
                'module_label': 'ModuleBaz',
                'body': self.default_body(),
            },
            headers=jwt_headers(teammate),
        )
        user_fetched = Response.get_by_id(json.loads(response.body)['uid'])
        self.assertFalse(user_fetched.private)


        # Can't create responses for other teams.
        self.testapp.post_json(
            '/api/responses',
            {
                'type': 'Team',
                'user_id': '',
                'team_id': 'Team_other',
                'parent_id': cycles[0].uid,
                'module_label': 'ModuleFoo',
            },
            headers=jwt_headers(other),
            status=403,
        )

        # Success for own team, team-level, public.
        response = self.testapp.post_json(
            '/api/responses',
            {
                'type': 'Team',
                'user_id': '',
                'team_id': team.uid,
                'parent_id': 'launch-step',
                'module_label': 'ModuleBar',
                'body': self.default_body(),
            },
            headers=jwt_headers(teammate),
        )
        team_fetched = Response.get_by_id(json.loads(response.body)['uid'])
        self.assertFalse(team_fetched.private)

    def test_update_simple(self):
        """Check ownership-based update permission, no conflicts."""
        other, teammate, team, cycles, responses = self.create()

        new_body = self.default_body()
        new_body['question']['value'] = 'change'

        # Forbidden to update other people's responses.
        self.testapp.put_json(
            '/api/responses/{}'.format(responses['user_team_other'].uid),
            {'body': new_body},
            headers=jwt_headers(teammate),
            status=403,
        )

        # Successful to update your own.
        self.testapp.put_json(
            '/api/responses/{}'.format(responses['user_team_user1'].uid),
            {'body': new_body},
            headers=jwt_headers(teammate),
        )
        self.assertTrue(self.body_values_match(
            Response.get_by_id(responses['user_team_user1'].uid).body,
            new_body,
        ))

        # Forbidden to update other teams.
        self.testapp.put_json(
            '/api/responses/{}'.format(responses['team_other'].uid),
            {'body': new_body},
            headers=jwt_headers(teammate),
            status=403,
        )

        # Successful to update team-level.
        self.testapp.put_json(
            '/api/responses/{}'.format(responses['team_team'].uid),
            {'body': new_body},
            headers=jwt_headers(teammate),
        )
        self.assertTrue(self.body_values_match(
            Response.get_by_id(responses['team_team'].uid).body,
            new_body,
        ))

    def test_update_question_level(self):
        """Question-level updates without conflicts."""
        other, teammate, team, cycles, responses = self.create()

        # New question. Added to the existing body (existing remain).
        response_id = responses['team_team'].uid
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {
                'body': {
                    'question_new': {'value': 'foo', 'modified': None}
                }
            },
            headers=jwt_headers(teammate),
        )
        fetched = Response.get_by_id(response_id)
        self.assertIn('question', fetched.body)
        # New question was given a timestamp.
        self.assertIsNotNone(fetched.body['question_new']['modified'])

        # Question unchanged. Do nothing, even if timestamp is old.
        old_body = self.default_body()
        old_body['question']['modified'] = '2000-01-01T00:00:00Z'
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {'body': old_body},
            headers=jwt_headers(teammate),
        )
        fetched = Response.get_by_id(response_id)
        self.assertEqual(
            fetched.body['question'],  # current value is...
            self.default_body()['question'],  # how it was originally created
        )

        # Non-stale update. Existing timestamp matches and value changes.
        new_body = self.default_body()
        new_body['question']['value'] = 'updated'
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {'body': new_body},
            headers=jwt_headers(teammate),
        )
        fetched = Response.get_by_id(response_id)
        self.assertEqual(
            fetched.body['question']['value'],
            new_body['question']['value'],
        )
        # Timestamp should update.
        self.assertGreater(
            fetched.body['question']['modified'],
            new_body['question']['modified'],
        )

    def test_update_with_conflicts(self):
        other, teammate, team, cycles, responses = self.create()

        # Value is changed and timestamp is old
        response_id = responses['team_team'].uid
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {
                'body': {
                    # based on stale data
                    'question': {
                        'value': 'bar',
                        'modified': '2000-01-01T00:00:00Z',
                    },
                    # this should be ignored b/c of above
                    'question_new': {
                        'value': 'foo',
                        'modified': '2000-01-01T00:00:00Z',
                    },
                },
            },
            headers=jwt_headers(teammate),
            status=409,
        )
        fetched = Response.get_by_id(response_id)

        # Whole update is rejected, body unchanged.
        self.assertEqual(responses['team_team'].body, fetched.body)

    def test_update_privacy_ignored(self):
        other, teammate, team, cycles, responses = self.create()

        # Starts private.
        to_update = responses['user_team_user1']
        self.assertTrue(to_update.private)

        # Try to make it non-private.
        self.testapp.put_json(
            '/api/responses/{}'.format(to_update.uid),
            dict(to_update.to_client_dict(), private=False),
            headers=jwt_headers(teammate),
        )

        # Privacy unchanged.
        fetched = Response.get_by_id(to_update.uid)
        self.assertEqual(to_update.private, fetched.private)

    def test_invalid_timestamp(self):
        """Timestamp is somehow _newer_ than the db. Indicates bigger error."""
        other, teammate, team, cycles, responses = self.create()

        # Value is changed and timestamp is old
        response_id = responses['team_team'].uid
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {
                'body': {
                    'question': {
                        'value': 'bar',
                        'modified': '2020-01-01T00:00:00Z',
                    },
                },
            },
            headers=jwt_headers(teammate),
            status=500,
        )

    def test_update_force(self):
        """Force flag is set, override conflicts and save."""
        other, teammate, team, cycles, responses = self.create()

        # Value is changed and timestamp is old
        response_id = responses['team_team'].uid
        now = datetime.datetime.now().strftime(config.iso_datetime_format)
        old_time = '2000-01-01T00:00:00Z'
        body = {
            # based on stale data, but will be accepted anyway
            'question': {'value': 'bar', 'modified': old_time},
            # this should be accepted also
            'question_new': {'value': 'foo', 'modified': old_time},
        }
        self.testapp.put_json(
            '/api/responses/{}?force=true'.format(response_id),
            {'body': body},
            headers=jwt_headers(teammate),
        )
        fetched = Response.get_by_id(response_id)

        for k, info in body.items():
            self.assertIn(k, fetched.body)
            self.assertEqual(info['value'], fetched.body[k]['value'])
            self.assertTrue(fetched.body[k]['modified'] >= now)

    def test_update_with_conflicts(self):
        other, teammate, team, cycles, responses = self.create()

        # Value is changed and timestamp is old
        response_id = responses['team_team'].uid
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {
                'body': {
                    # based on stale data
                    'question': {
                        'value': 'bar',
                        'modified': '2000-01-01T00:00:00Z',
                    },
                    # this should be ignored b/c of above
                    'question_new': {
                        'value': 'foo',
                        'modified': '2000-01-01T00:00:00Z',
                    },
                },
            },
            headers=jwt_headers(teammate),
            status=409,
        )
        fetched = Response.get_by_id(response_id)

        # Whole update is rejected, body unchanged.
        self.assertEqual(responses['team_team'].body, fetched.body)

    def test_invalid_timestamp(self):
        """Timestamp is somehow _newer_ than the db. Indicates bigger error."""
        other, teammate, team, cycles, responses = self.create()

        # Value is changed and timestamp is old
        response_id = responses['team_team'].uid
        self.testapp.put_json(
            '/api/responses/{}'.format(response_id),
            {
                'body': {
                    'question': {
                        'value': 'bar',
                        'modified': '2020-01-01T00:00:00Z',
                    },
                },
            },
            headers=jwt_headers(teammate),
            status=500,
        )

    def test_update_force(self):
        """Force flag is set, override conflicts and save."""
        other, teammate, team, cycles, responses = self.create()

        # Value is changed and timestamp is old
        response_id = responses['team_team'].uid
        now = datetime.datetime.now().strftime(config.iso_datetime_format)
        old_time = '2000-01-01T00:00:00Z'
        body = {
            # based on stale data, but will be accepted anyway
            'question': {'value': 'bar', 'modified': old_time},
            # this should be accepted also
            'question_new': {'value': 'foo', 'modified': old_time},
        }
        self.testapp.put_json(
            '/api/responses/{}?force=true'.format(response_id),
            {'body': body},
            headers=jwt_headers(teammate),
        )
        fetched = Response.get_by_id(response_id)

        for k, info in body.items():
            self.assertIn(k, fetched.body)
            self.assertEqual(info['value'], fetched.body[k]['value'])
            self.assertTrue(fetched.body[k]['modified'] >= now)

    def test_delete(self):
        other, teammate, team, cycles, responses = self.create()

        # Forbidden to delete other people's responses.
        self.testapp.delete(
            '/api/responses/{}'.format(responses['user_team_other'].uid),
            headers=jwt_headers(teammate),
            status=403,
        )

        # Successful to delete your own.
        self.testapp.delete(
            '/api/responses/{}'.format(responses['user_team_user1'].uid),
            headers=jwt_headers(teammate),
            status=204,
        )
        self.assertIsNone(Response.get_by_id(responses['user_team_user1'].uid))

        # Forbidden to delete other team's responses.
        self.testapp.delete(
            '/api/responses/{}'.format(responses['team_other'].uid),
            headers=jwt_headers(teammate),
            status=403,
        )

        # Successful to delete responses from your team.
        self.testapp.delete(
            '/api/responses/{}'.format(responses['team_team'].uid),
            headers=jwt_headers(teammate),
            status=204,
        )
        self.assertIsNone(Response.get_by_id(responses['team_team'].uid))

    def test_body_too_large(self):
        other, teammate, team, cycles, responses = self.create()

        response_params = {
            'user_id': teammate.uid,
            'team_id': team.uid,
            'parent_id': cycles[1].uid,
            'module_label': 'ModuleBar',
        }

        # A property is too long.
        self.testapp.post_json(
            '/api/responses',
            dict(response_params, body={'foo': {'value': 'x' * 10**5}}),
            headers=jwt_headers(teammate),
            status=413,
        )

        # Too many properties.
        self.testapp.post_json(
            '/api/responses',
            dict(
                response_params,
                body={'foo{}'.format(x): {'value': x} for x in range(10**3)},
            ),
            headers=jwt_headers(teammate),
            status=413,
        )

        # Both posts should have prevented new responses from being stored.
        self.assertEqual(len(Response.get()), len(responses))

        # Successful POST
        resp = self.testapp.post_json(
            '/api/responses',
            dict(response_params, body={'safe': {'value': 'data'}}),
            headers=jwt_headers(teammate),
        )
        resp_dict = json.loads(resp.body)
        put_url = '/api/responses/{}'.format(resp_dict['uid'])

        # Same errors but for PUT
        # A property is too long.
        self.testapp.put_json(
            put_url,
            {'body': {'foo': {'value': 'x' * 10**5}}},
            headers=jwt_headers(teammate),
            status=413,
        )
        # Too many properties.
        self.testapp.put_json(
            put_url,
            {'body': {'foo{}'.format(x): {'value': x} for x in range(10**3)}},
            headers=jwt_headers(teammate),
            status=413,
        )

        # Puts should have left body unchanged.
        fetched_body = Response.get_by_id(resp_dict['uid']).body
        self.assertEqual(fetched_body.keys(), ['safe'])
        self.assertEqual(fetched_body['safe']['value'], 'data')
