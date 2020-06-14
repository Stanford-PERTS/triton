"""Test endpoints
    /api/users/X and
    /api/teams/X/users and
    /api/organizations/X/users."""

import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Team, Program, Organization, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiUsers(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiUsers, self).set_up()

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
                'program': Program.get_table_definition(),
                'organization': Organization.get_table_definition(),
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

    def test_get_all_requires_auth(self):
        response = self.testapp.get(
            '/api/users',
            status=401,
        )

    def test_get_for_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/users',
            status=401,
        )

    def test_get_for_organization_requires_auth(self):
        response = self.testapp.get(
            '/api/organizations/Organization_foo/users',
            status=401,
        )

    def test_get_all_forbidden(self):
        """Non-supers get 403."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/users',
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_all_super(self):
        """Supers can query all users."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        user = User.create(name='super', email='super@bar.com',
                           user_type='super_admin')
        user.put()

        response = self.testapp.get(
            '/api/users',
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_all_for_team(self):
        """You can list team members of your team."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()
        response = self.testapp.get(
            '/api/teams/{}/users'.format(team.uid),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_all_for_organization(self):
        """You can list co-admins of your organization."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_organizations=[org.uid])
        user.put()
        response = self.testapp.get(
            '/api/organizations/{}/users'.format(org.uid),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_one_for_team(self):
        """You can get a single team member."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        teammate = User.create(name='teammate', email='teammate@bar.com',
                               owned_teams=[team.uid])
        teammate.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()
        response = self.testapp.get(
            '/api/teams/{}/users/{}'.format(team.uid, teammate.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['uid'], teammate.uid)

    def test_get_one_for_organization(self):
        """You can get a single organization admin."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()
        coAdmin = User.create(name='coAdmin', email='coAdmin@bar.com',
                               owned_organizations=[org.uid])
        coAdmin.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_organizations=[org.uid])
        user.put()
        response = self.testapp.get(
            '/api/organizations/{}/users/{}'.format(org.uid, coAdmin.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['uid'], coAdmin.uid)

    def test_get_owned(self):
        """You can get yourself."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/users/{}'.format(user.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['uid'], user.uid)

    def test_get_all_for_other_team_forbidden(self):
        """You can't list users from someone else's teams."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/teams/{}/users'.format(team.uid),
            headers=self.login_headers(user),
            status=403
        )

    def test_get_all_for_other_organization(self):
        """You can't list users from someone else's organization."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/organizations/{}/users'.format(org.uid),
            headers=self.login_headers(user),
            status=403
        )

    def test_get_one_for_other_team_forbidden(self):
        """You can't list users from someone else's teams."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        teammate = User.create(name='teammate', email='teammate@bar.com',
                               owned_teams=[team.uid])
        teammate.put()
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/teams/{}/users/{}'.format(team.uid, teammate.uid),
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_one_for_other_organization_forbidden(self):
        """You can't list users from someone else's organizations."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()
        coAdmin = User.create(name='coAdmin', email='teammate@bar.com',
                               owned_organizations=[org.uid])
        coAdmin.put()
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/organizations/{}/users/{}'.format(org.uid, coAdmin.uid),
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_for_not_found_team(self):
        """You can't list users for non existant team."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/teams/Team_other/users',
            headers=self.login_headers(user),
            status=404
        )

    def test_get_for_not_found_organization(self):
        """You can't list users for non existant organization."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/organizations/Organization_other/users',
            headers=self.login_headers(user),
            status=404
        )

    def test_update_privileges_fails(self):
        """Can't escalate your privileges via user type or relationships."""
        user = User.create(name='foo', email='foo@bar.com', user_type='user',
                           owned_teams=[], owned_organizations=[])
        user.put()

        # You get a 200, but the changes you requested don't happen.
        response = self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'user_type': 'super_admin', 'owned_teams': ['Team_foo'],
             'owned_organizations': ['Organization_foo']},
            headers=self.login_headers(user),
        )
        user_dict = json.loads(response.body)
        self.assertEqual(user.user_type, user_dict['user_type'])
        self.assertEqual(user.owned_teams, user_dict['owned_teams'])
        self.assertEqual(user.owned_organizations,
                         user_dict['owned_organizations'])

        # Also not changed in the db.
        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(user.user_type, fetched_user.user_type)
        self.assertEqual(user.owned_teams, fetched_user.owned_teams)
        self.assertEqual(user.owned_organizations,
                         fetched_user.owned_organizations)

    def test_remove_from_team_forbidden(self):
        """Normally you can't modify someone else's membership."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com', user_type='user',
                           owned_teams=['Team_foo'])
        req = User.create(name='requestor', email='bar@foo.com',
                          user_type='user')
        user.put()
        req.put()

        response = self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'owned_teams': []},
            headers=self.login_headers(req),
            status=403,
        )

        # Not changed in the db.
        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(user.user_type, fetched_user.user_type)
        self.assertEqual(user.owned_teams, fetched_user.owned_teams)

    def test_remove_from_organization_forbidden(self):
        """Normally you can't modify someone else's membership."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()
        user = User.create(name='Admin', email='foo@bar.com', user_type='user',
                           owned_organizations=['Organization_foo'])
        req = User.create(name='Invalid Requestor', email='bar@foo.com',
                          user_type='user')
        user.put()
        req.put()

        response = self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'owned_organizations': []},
            headers=self.login_headers(req),
            status=403,
        )

        # Not changed in the db.
        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(user.user_type, fetched_user.user_type)
        self.assertEqual(user.owned_organizations,
                         fetched_user.owned_organizations)

    def test_remove_fellow_from_organization_success(self):
        """Admins can remove each other."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()
        user = User.create(name='Admin', email='foo@bar.com', user_type='user',
                           owned_organizations=['Organization_foo'])
        req = User.create(name='Valid Requestor', email='bar@foo.com',
                          user_type='user',
                          owned_organizations=['Organization_foo'])
        user.put()
        req.put()

        # Successful removal.
        response = self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'owned_organizations': []},
            headers=self.login_headers(req),
        )
        self.assertEqual(json.loads(response.body)['owned_organizations'], [])

        # Changed in the db.
        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(fetched_user.owned_organizations, [])
        self.assertEqual(user.user_type, fetched_user.user_type)

    def test_remove_last_from_organization_forbidden(self):
        """The last member of an organization can't leave."""
        org = Organization.create(name='foo', program_id=self.program.uid)
        org.put()

        user = User.create(name='foo', email='foo@bar.com', user_type='user',
                           owned_organizations=[org.uid])
        user.put()

        self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'owned_organizations': []},
            headers=self.login_headers(user),
        )

        # not changed in the db
        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(user.user_type, fetched_user.user_type)
        self.assertEqual(user.owned_organizations,
                         fetched_user.owned_organizations)

    def test_captain_removes_teammate_success(self):
        """Captains can remove teammembers."""
        team = Team.create(name='foo', program_id=self.program.uid)
        user = User.create(name='foo', email='foo@bar.com', user_type='user',
                           owned_teams=[team.uid])
        captain = User.create(name='captain', email='captain@foo.com',
                              user_type='user', owned_teams=[team.uid])
        team.captain_id = captain.uid
        user.put()
        captain.put()
        team.put()

        response = self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'owned_teams': []},
            headers=self.login_headers(captain),
        )

        # User is removed from team.
        self.assertEqual(json.loads(response.body)['owned_teams'], [])

    def test_remove_self_from_team_success(self):
        """Can remove self from team."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.program.uid)
        user = User.create(name='foo', email='foo@bar.com', user_type='user',
                           owned_teams=[team.uid])
        user.put()
        team.put()

        response = self.testapp.put_json(
            '/api/users/{}'.format(user.uid),
            {'owned_teams': []},
            headers=self.login_headers(user),
        )

        # User is removed from team.
        self.assertEqual(json.loads(response.body)['owned_teams'], [])

    def test_method_not_allowed(self):
        """Typical RestHandler methods are correctly disallowed."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        self.testapp.post_json(
            '/api/users',
            {'name': 'new dude', 'email': 'new@dude.com'},
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.delete(
            '/api/users/User_foo',
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.post_json(
            '/api/teams/Team_foo/users',
            {'name': 'new dude', 'email': 'new@dude.com'},
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.put_json(
            '/api/teams/Team_foo/users',
            {'name': 'new dude', 'email': 'new@dude.com'},
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.delete(
            '/api/teams/Team_foo/users',
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.post_json(
            '/api/organizations/Organization_foo/users',
            {'name': 'new dude', 'email': 'new@dude.com'},
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.put_json(
            '/api/organizations/Organization_foo/users',
            {'name': 'new dude', 'email': 'new@dude.com'},
            headers=self.login_headers(user),
            status=405,
        )
        self.testapp.delete(
            '/api/organizations/Organization_foo/users',
            headers=self.login_headers(user),
            status=405,
        )
