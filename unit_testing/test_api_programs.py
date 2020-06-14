"""Tests endpoints for programs."""

import json
import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Organization, Program, Team, User
from unit_test_helper import ConsistencyTestCase
import config
import jwt_helper
import mysql_connection


class TestApiPrograms(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiPrograms, self).set_up()

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
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        self.ep = Program.create(
            name="The Engagement Project",
            label="ep19",
            preview_url='foo.com',
        )
        self.ep.put()

    def test_get_all_programs(self):
        user = User.create(name='foo', email='foo@bar.com')
        user.put()

        response = self.testapp.get(
            '/api/programs',
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)

        # Inactive program not present.
        self.assertEqual(len(response_list), 2)

        # Even if we delete programs from the db, the second query should still
        # success b/c it's in memcache
        response2 = self.testapp.get(
            '/api/programs',
            headers=self.login_headers(user),
        )
        response_list2 = json.loads(response.body)

        self.assertEqual(response_list, response_list2)

    def create_for_search(self):
        # Test that users can be matched on either name or email.
        admin_foo = User.create(name="Admin Foo", email="admin@perts.net")
        user_foo1 = User.create(name="User Foo", email="user1@perts.net")
        user_foo2 = User.create(name="Generic Name", email="user2@foo.net")
        user_bar = User.create(name="User Bar", email="user3@perts.net")

        org_foo = Organization.create(name="Org Foo", program_id=self.ep.uid)
        org_bar = Organization.create(name="Org Bar", program_id=self.ep.uid)

        team_foo = Team.create(name="Team Foo", program_id=self.ep.uid,
                               captain_id=user_foo1.uid)
        team_bar = Team.create(name="Team Bar", program_id=self.ep.uid,
                               captain_id=user_bar.uid)

        cl_foo = Classroom.create(
            name="Class Foo",
            code="foo",
            team_id=team_foo.uid,
            contact_id=user_foo2.uid,
        )
        cl_bar = Classroom.create(
            name="Class Bar",
            code="bar",
            team_id=team_bar.uid,
            contact_id="User_contact",
        )

        # Test that users can be matched on either name or email.
        admin_foo.owned_organizations = [org_foo.uid]
        user_foo1.owned_teams = [team_foo.uid]
        user_foo2.owned_teams = [team_foo.uid]
        user_bar.owned_teams = [team_bar.uid]

        Organization.put_multi([org_foo, org_bar])
        Team.put_multi([team_foo, team_bar])
        Classroom.put_multi([cl_foo, cl_bar])
        User.put_multi([admin_foo, user_foo1, user_foo2, user_bar])

        return (
            org_foo, org_bar, team_foo, team_bar, cl_foo, cl_bar,
            admin_foo, user_foo1, user_foo2, user_bar
        )


    def test_search_requires_auth(self):
        self.testapp.get(
            '/api/programs/{}/search?q=foo'.format(self.ep.uid),
            status=401,
        )

    def test_search_requires_supers(self):
        user = User.create(name='User', email='user@user.com')
        user.put()

        self.testapp.get(
            '/api/programs/{}/search?q=foo'.format(self.ep.uid),
            headers=self.login_headers(user),
            status=403,
        )

    def result_to_ids(self, result):
        out = {}
        for k, v in result.items():
            out[k] = set([e['uid'] if type(e) == dict else e.uid for e in v])

        return out

    def test_basic_search(self):
        (
            org_foo, org_bar, team_foo, team_bar, cl_foo, cl_bar,
            admin_foo, user_foo1, user_foo2, user_bar
        ) = self.create_for_search()

        super_admin = User.create(name='Super', email='super@admin.com',
                                  user_type='super_admin')
        super_admin.put()

        result = self.testapp.get(
            '/api/programs/{}/search?q=foo'.format(self.ep.uid),
            headers=self.login_headers(super_admin),
        )
        result_dict = json.loads(result.body)

        expected = {
            'organizations': [org_foo],
            'teams':         [team_foo],
            'classrooms':    [cl_foo],
            'users':         [admin_foo, user_foo1, user_foo2],
        }

        self.assertEqual(
            self.result_to_ids(expected),
            self.result_to_ids(result_dict)
        )

        # Classrooms should have an extra property: team name.
        self.assertIn('team_name', result_dict['classrooms'][0])

    def test_membership_search(self):
        (
            org_foo, org_bar, team_foo, team_bar, cl_foo, cl_bar,
            admin_foo, user_foo1, user_foo2, user_bar
        ) = self.create_for_search()

        super_admin = User.create(name='Super', email='super@admin.com',
                                  user_type='super_admin')
        super_admin.put()

        admin_url = '/api/programs/{}/search?q=user:{}'.format(
            self.ep.uid, admin_foo.email)
        admin_result = self.testapp.get(
            admin_url,
            headers=self.login_headers(super_admin),
        )
        admin_expected = {
            'organizations': [org_foo],
            'teams': [],
            'classrooms': [],
            'users': [admin_foo],
        }
        self.assertEqual(
            self.result_to_ids(json.loads(admin_result.body)),
            self.result_to_ids(admin_expected),
        )

        captain_url = '/api/programs/{}/search?q=user:{}'.format(
            self.ep.uid, user_foo1.email)
        captain_result = self.testapp.get(
            captain_url,
            headers=self.login_headers(super_admin),
        )
        captain_expected = {
            'organizations': [],
            'teams': [team_foo],
            'classrooms': [],
            'users': [user_foo1],
        }
        self.assertEqual(
            self.result_to_ids(json.loads(captain_result.body)),
            self.result_to_ids(captain_expected),
        )

        contact_url = '/api/programs/{}/search?q=user:{}'.format(
            self.ep.uid, user_foo2.email)
        contact_result = self.testapp.get(
            contact_url,
            headers=self.login_headers(super_admin),
        )
        contact_expected = {
            'organizations': [],
            'teams': [team_foo],
            'classrooms': [cl_foo],
            'users': [user_foo2],
        }
        contact_result_dict = json.loads(contact_result.body)
        self.assertEqual(
            self.result_to_ids(contact_result_dict),
            self.result_to_ids(contact_expected),
        )
        self.assertIn('team_name', contact_result_dict['classrooms'][0])


