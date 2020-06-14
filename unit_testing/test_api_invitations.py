"""Test endpoints /api/users/X and /api/teams/X/users."""

import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Organization, Program, Team, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiInvitations(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    invite_params = {
        'user_id': 'User_invitee',
        'email': 'invitee@perts.net',
        'name': 'Invitee',
        'phone_number': '+1 (888) 555-5555',
    }

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiInvitations, self).set_up()

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
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
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

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def create_team(self):
        team = Team.create(name='Team Foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        return team

    def create_org(self):
        org = Organization.create(
            name='Organization Bar', program_id=self.program.uid)
        org.put()
        return org

    def test_invite_requires_auth(self):
        self.testapp.post_json(
            '/api/invitations',
            self.invite_params,
            status=401,
        )

    def test_invite_team_forbidden(self):
        """Can't invite to a team you don't own."""
        team = self.create_team()
        inviter = User.create(email='inviter@perts.net')
        inviter.put()

        params = dict(self.invite_params, team_id=team.uid)

        self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
            status=403,
        )

    def test_invite_org_forbidden(self):
        """Can't invite to an org you don't own."""
        inviter = User.create(email='inviter@perts.net')
        inviter.put()

        params = dict(self.invite_params, organization_id='Organization_foo')

        self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
            status=403,
        )

    def test_invite_team_missing(self):
        team_id = 'Team_foo'
        params = dict(self.invite_params, team_id=team_id)
        inviter = User.create(email='inviter@perts.net',
                              owned_teams=[team_id])
        inviter.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
            status=400,
        )

    def test_invite_org_missing(self):
        organization_id = 'Organization_foo'
        params = dict(self.invite_params, organization_id=organization_id)
        inviter = User.create(email='inviter@perts.net',
                              owned_organizations=[organization_id])
        inviter.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
            status=400,
        )

    def test_invite_existing_team_owner(self):
        """Inviting someone already on the team succeeds."""
        team = self.create_team()
        params = dict(self.invite_params, team_id=team.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_teams=[team.uid])
        inviter.put()
        invitee = User.create(
            id=User.convert_uid(params['user_id']),
            email=params['email'],
            owned_teams=[team.uid],
        )
        invitee.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'existing user')
        fetched_invitee = User.get_by_id(invitee.uid)
        self.assertEqual(len(fetched_invitee.owned_teams), 1)

    def test_invite_existing_org_owner(self):
        """Inviting someone already on the org succeeds."""
        organization = self.create_org()
        params = dict(self.invite_params, organization_id=organization.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_organizations=[organization.uid])
        inviter.put()
        invitee = User.create(
            id=User.convert_uid(params['user_id']),
            email=params['email'],
            owned_organizations=[organization.uid],
        )
        invitee.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'existing user')
        fetched_invitee = User.get_by_id(invitee.uid)
        self.assertEqual(len(fetched_invitee.owned_organizations), 1)

    def test_invite_existing_team_other(self):
        team = self.create_team()
        params = dict(self.invite_params, team_id=team.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_teams=[team.uid])
        inviter.put()
        invitee = User.create(
            id=User.convert_uid(params['user_id']),
            email=params['email'],
        )
        invitee.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'existing user')

        # User should now be on the team.
        fetched_invitee = User.get_by_id(invitee.uid)
        self.assertIn(team.uid, fetched_invitee.owned_teams)

    def test_invite_existing_org_other(self):
        organization = self.create_org()
        params = dict(self.invite_params, organization_id=organization.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_organizations=[organization.uid])
        inviter.put()
        invitee = User.create(
            id=User.convert_uid(params['user_id']),
            email=params['email'],
        )
        invitee.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'existing user')

        # User should now be on the team.
        fetched_invitee = User.get_by_id(invitee.uid)
        self.assertIn(organization.uid, fetched_invitee.owned_organizations)

    def test_invite_new_team(self):
        team = self.create_team()
        params = dict(self.invite_params, team_id=team.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_teams=[team.uid])
        inviter.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'new user')

        # Db should record user with requested properties.
        invitee = User.get_by_id(params['user_id'])
        self.assertEqual(invitee.name, params['name'])
        self.assertEqual(invitee.phone_number,
                         params['phone_number'])
        # User should now be on the team.
        self.assertIn(team.uid, invitee.owned_teams)

    def test_invite_new_org(self):
        organization = self.create_org()
        params = dict(self.invite_params, organization_id=organization.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_organizations=[organization.uid])
        inviter.put()

        response = self.testapp.post_json(
            '/api/invitations',
            params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'new user')

        # Db should record user with requested properties.
        invitee = User.get_by_id(params['user_id'])
        self.assertEqual(invitee.name, params['name'])
        self.assertEqual(invitee.phone_number,
                         params['phone_number'])
        # User should now be on the organization.
        self.assertIn(organization.uid, invitee.owned_organizations)

    def test_invite_existing_mismatch(self):
        """The neptune id is different than the existing triton account."""
        team = self.create_team()
        params = dict(self.invite_params, team_id=team.uid)
        inviter = User.create(email='inviter@perts.net',
                              owned_teams=[team.uid])
        inviter.put()
        invitee = User.create(email=self.invite_params['email'])
        invitee.put()

        params = self.invite_params.copy()
        params['user_id'] = 'User_from-neptune'

        response = self.testapp.post_json(
            '/api/invitations',
            self.invite_params,
            headers=self.login_headers(inviter),
        )
        self.assertEqual(json.loads(response.body), 'existing user')

        # Db should reflect the existing, mismatched, triton user id, which
        # will be corrected the next time the invitee signs in.
        self.assertIsNone(User.get_by_id(params['user_id']))
        self.assertIsNotNone(User.get_by_id(invitee.uid))
