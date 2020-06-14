"""Test endpoints /api/organizations/X and /api/users/X/organizations.

Indirectly tests RestHandler with SqlModel. Other api suites may be less
comprehensive because they naively inherit from RestHandler and wouldn't
benefit from extra coverage.
"""

import datetime
import logging
import unittest
import webapp2
import webtest

from api_handlers import api_routes
from model import Cycle, Email, Organization, Program, Response, Team, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiOrganizations(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    # So we can look at what emails are queued right away.
    consistency_probability = 1

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiOrganizations, self).set_up()

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

        self.beleset_program = Program.create(
            name="Copilot-Elevate",
            label='beleset19',
            min_cycles=2,
            active=True,
            preview_url='foo.com',
        )
        self.beleset_program.put()

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def test_get_all_requires_auth(self):
        response = self.testapp.get(
            '/api/organizations',
            status=401,
        )

    def test_get_own_requires_auth(self):
        response = self.testapp.get(
            '/api/users/User_foo/organizations',
            status=401,
        )

    def test_get_all_forbidden(self):
        """Non-supers get 403."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/organizations',
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_all_super(self):
        """Supers can query all orgs."""
        org = Organization.create(
            name='Foo Org', program_id=self.program.uid)
        org.put()
        super_admin = User.create(name='super', email='super@bar.com',
                                  user_type='super_admin')
        super_admin.put()
        response = self.testapp.get(
            '/api/organizations',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_by_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/organizations',
            status=401,
        )

    def test_get_by_team(self):
        org = Organization.create(name='Foo Org', program_id=self.program.uid)
        org.put()
        team = Team.create(name='Team Foo', captain_id='User_cap',
                           organization_ids=[org.uid],
                           program_id=self.program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()

        response = self.testapp.get(
            '/api/teams/{}/organizations'.format(team.uid),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)
        self.assertEqual(response_list[0]['uid'], org.uid)

    def test_get_by_team_forbidden(self):
        org = Organization.create(
            name='Foo Org', program_id=self.program.uid)
        org.put()
        team = Team.create(name='Team Foo', captain_id='User_cap',
                           organization_ids=[org.uid],
                           program_id=self.program.uid)
        team.put()
        other = User.create(name='other', email='other@bar.com',
                            owned_teams=[])
        other.put()

        response = self.testapp.get(
            '/api/teams/{}/organizations'.format(team.uid),
            headers=self.login_headers(other),
            status=403,
        )

    def create_for_paging(self, n):
        # Pad numeric names so they sort alphabetically.
        orgs = [
            Organization.create(
                name=str(x).rjust(2, '0'), program_id=self.program.uid)
            for x in range(n)
        ]
        Organization.put_multi(orgs)
        super_admin = User.create(name='super', email='super@bar.com',
                                 user_type='super_admin')
        super_admin.put()

        return orgs, super_admin

    def test_get_first_page(self):
        orgs, super_admin = self.create_for_paging(20)

        response = self.testapp.get(
            '/api/organizations?n=10',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)

        # We should have the first 10 results, in alphabetical order.
        self.assertEqual([o.uid for o in orgs[:10]],
                         [o['uid'] for o in response_list])

    def test_get_offset_page(self):
        orgs, super_admin = self.create_for_paging(20)

        response = self.testapp.get(
            '/api/organizations?n=10&cursor=11',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)

        # We should have results 11-20, in order.
        self.assertEqual([o.uid for o in orgs[11:]],
                         [o['uid'] for o in response_list])

    def test_link_header(self):
        # 5 orgs for first, previous, current, next, and last.
        orgs, super_admin = self.create_for_paging(5)

        response = self.testapp.get(
            '/api/organizations?n=1&cursor=2',
            headers=self.login_headers(super_admin),
        )
        self.assertEqual(
            response.headers['Link'],
            '</api/organizations?n=1&cursor=2&order=name>;rel=self,'
            '</api/organizations?order=name&n=1>;rel=first,'
            '</api/organizations?cursor=1&order=name&n=1>;rel=previous,'
            '</api/organizations?cursor=3&order=name&n=1>;rel=next,'
            '</api/organizations?cursor=4&order=name&n=1>;rel=last',
        )

    def test_link_header_for_program(self):
        """Links header should work when filtering to program"""
        program_cset = Program.create(
            name="CSET",
            label="cset",
            preview_url='foo.com',
        )
        program_cset.put()

        cset_org = Organization.create(
            name="cset Organization",
            program_id=program_cset.uid
        )
        cset_org.put()
        ep_orgs, super_admin = self.create_for_paging(12)

        # cset only has 1 organization, so no paging past first page.
        response = self.testapp.get(
            '/api/organizations?program_id={}&n=10'.format(program_cset.uid),
            headers=self.login_headers(super_admin),
        )

        self.assertEqual(
            response.headers['Link'],
            (
                '<{path}?program_id={pid}&n=10&order=name>;rel=self,'
                '<{path}?order=name&program_id={pid}&n=10>;rel=first,'
                '<{path}?cursor=0&order=name&program_id={pid}&n=10>;rel=previous,'
                '<{path}?cursor=0&order=name&program_id={pid}&n=10>;rel=next,'
                '<{path}?cursor=0&order=name&program_id={pid}&n=10>;rel=last'
            ).format(path='/api/organizations', pid=program_cset.uid)
        )

        # EP has 12 organizations, so there is paging past first page.
        response = self.testapp.get(
            '/api/organizations?program_id={}&n=10'.format(self.program.uid),
            headers=self.login_headers(super_admin),
        )

        self.assertEqual(
            response.headers['Link'],
            (
                '<{path}?program_id={pid}&n=10&order=name>;rel=self,'
                '<{path}?order=name&program_id={pid}&n=10>;rel=first,'
                '<{path}?cursor=0&order=name&program_id={pid}&n=10>;rel=previous,'
                '<{path}?cursor=10&order=name&program_id={pid}&n=10>;rel=next,'
                '<{path}?cursor=10&order=name&program_id={pid}&n=10>;rel=last'
            ).format(path='/api/organizations', pid=self.program.uid)
        )

    def test_get_all_for_self(self):
        """You can list your own orgs."""
        org = Organization.create(
            name='foo', program_id=self.program.uid)
        org.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_organizations=[org.uid])
        user.put()
        response = self.testapp.get(
            '/api/users/{}/organizations'.format(user.uid),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_owned(self):
        """You can get an org you own."""
        org = Organization.create(
            name='foo', program_id=self.program.uid)
        org.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_organizations=[org.uid])
        user.put()
        response = self.testapp.get(
            '/api/organizations/{}'.format(org.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['uid'], org.uid)

    def test_get_for_other_forbidden(self):
        """You can't list someone else's orgs."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/users/User_other/organizations',
            headers=self.login_headers(user),
            status=403
        )

    def test_create(self):
        """Anyone can create an org."""
        org_name = 'Org Foo'
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.post_json(
            '/api/organizations',
            {'name': org_name, 'program_id': self.program.uid},
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['name'], org_name)

        fetched_org = Organization.get_by_id(response_dict['uid'])
        self.assertIsNotNone(fetched_org)

        # Remove user's cookie so we can use the test app as other people.
        self.testapp.reset()
        return user, response_dict

    def test_create_first_sends_email(self):
        """If, on POST, user is admin of one Elevate org, they get an email."""

        admin_first = User.create(name='foo', email='foo@bar.com')
        admin_first.put()

        # Creating an org in EP doesn't trigger any emails.
        org_params = {'name': 'EP 1', 'program_id': self.program.uid}
        self.testapp.post_json(
            '/api/organizations',
            org_params,
            headers=self.login_headers(admin_first),
        )
        self.assertEqual(Email.count(), 0)

        # First org created for BELESET sends email (even though they have an
        # org in another program).
        org_params1 = {'name': 'Org 1', 'program_id': self.beleset_program.uid}
        result1 = self.testapp.post_json(
            '/api/organizations',
            org_params1,
            headers=self.login_headers(admin_first),
        )
        self.assertEqual(Email.count(), 1)
        email1 = Email.get()[0]
        self.assertEqual(email1.template, 'beleset19/welcome.html')
        self.assertIn(admin_first.email, email1.to_address)

        # User who creates a second org doesn't get the email.
        org_params2 = {'name': 'Org 2', 'program_id': self.beleset_program.uid}
        result2 = self.testapp.post_json(
            '/api/organizations',
            org_params2,
            headers=self.login_headers(admin_first),
        )

        # Only the first email is there, no second email.
        self.assertEqual(Email.count(), 1)

    def test_put_own(self):
        user, org_dict = self.test_create()
        org_dict['name'] = 'Org Bar'
        response = self.testapp.put_json(
            '/api/organizations/{}'.format(org_dict['uid']),
            org_dict,
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)

        # The timestamps can vary by one second and comparisons make this test
        # flakey, so strip them.
        del response_dict['created']
        del response_dict['modified']
        del org_dict['created']
        del org_dict['modified']

        self.assertEqual(response_dict, org_dict)

    def test_put_other(self):
        user = User.create(name='foo', email='foo@bar.com')
        org = Organization.create(
            name='Org Foo', program_id=self.program.uid)
        org.put()

        response = self.testapp.put_json(
            '/api/organizations/{}'.format(org.uid),
            {'name': 'Org Other'},
            headers=self.login_headers(user),
            status=403,
        )

    def test_put_ignores_code(self):
        user, org_dict = self.test_create()
        org_dict['code'] = 'bullwinkle'
        response = self.testapp.put_json(
            '/api/organizations/{}'.format(org_dict['uid']),
            org_dict,
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertNotEqual(response_dict['code'], org_dict['code'])

    def test_delete(self):
        """Owners can delete their orgs."""
        user, org_dict = self.test_create()
        response = self.testapp.delete(
            '/api/organizations/{}'.format(org_dict['uid']),
            headers=self.login_headers(user),
            status=204
        )
        self.assertIsNone(Organization.get_by_id(org_dict['uid']))
        return response, user, org_dict

    def test_delete_other_forbidden(self):
        user, org_dict = self.test_create()
        other = User.create(name='other', email='other@bar.com')
        other.put()
        response = self.testapp.delete(
            '/api/organizations/{}'.format(org_dict['uid']),
            headers=self.login_headers(other),
            status=403
        )
        self.assertIsNotNone(Organization.get_by_id(org_dict['uid']))

    def test_delete_disassociates_teams(self):
        """When you delete an org, associated teams lose their org id."""
        user, org_dict = self.test_create()
        teams = [
            Team.create(
                name="Team Foo",
                organization_ids=[org_dict['uid']],
                captain_id='User_captain',
                program_id=self.program.uid,
            ),
            Team.create(
                name="Team Bar",
                organization_ids=[org_dict['uid']],
                captain_id='User_captain',
                program_id=self.program.uid,
            ),
        ]
        Team.put_multi(teams)

        response = self.testapp.delete(
            '/api/organizations/{}'.format(org_dict['uid']),
            headers=self.login_headers(user),
            status=204
        )

        # Make sure the teams have lost their association to the org.
        for t in teams:
            fetched = Team.get_by_id(t.uid)
            self.assertNotIn(org_dict['uid'], fetched.organization_ids)

    def test_delete_disassociates_users(self):
        """When you delete an org, associated users lose their org id."""
        user, org_dict = self.test_create()

        response = self.testapp.delete(
            '/api/organizations/{}'.format(org_dict['uid']),
            headers=self.login_headers(user),
            status=204
        )

        # Make sure the teams have lost their association to the org.
        fetched = User.get_by_id(user.uid)
        self.assertNotIn(org_dict['uid'], fetched.owned_organizations)

    def test_change_code_requires_auth(self):
        response = self.testapp.post(
            '/api/organizations/{}/code',
            status=401,
        )

    def test_change_code(self):
        org = Organization.create(
            name='Foo Org', program_id=self.program.uid)
        org.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_organizations=[org.uid])
        user.put()

        response = self.testapp.post(
            '/api/organizations/{}/code'.format(org.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)

        self.assertEqual(response_dict['uid'], org.uid)
        self.assertIsNotNone(response_dict['code'])
        self.assertNotEqual(response_dict['code'], org.code)

    def test_change_code_forbidden(self):
        org = Organization.create(
            name='Foo Org', program_id=self.program.uid)
        org.put()
        other = User.create(name='other', email='other@bar.com',
                            owned_organizations=[])
        other.put()

        response = self.testapp.post(
            '/api/organizations/{}/code'.format(org.uid),
            headers=self.login_headers(other),
            status=403,
        )

    def create_for_dashboard(self, org, x=0):
        x_label = str(x).rjust(2, '0')
        team = Team.create(
            name='Team {}'.format(x_label),
            captain_id='User_captain_{}'.format(x_label),
            organization_ids=[org.uid],
            program_id=self.program.uid,
        )
        user = User.create(
            name='User {}'.format(x_label),
            email='foo.{}@bar.com'.format(x_label),
            owned_teams=[team.uid]
        )
        cycle = Cycle.create(
            team_id=team.uid,
            ordinal=1,
            start_date=datetime.date.today() - datetime.timedelta(days=1),
            end_date=datetime.date.today() + datetime.timedelta(days=1),
        )
        response = Response.create(
            type=Response.USER_LEVEL_SYMBOL,
            user_id=user.uid,
            team_id=team.uid,
            parent_id=cycle.uid,
            module_label='DemoModule',
            progress=50,
            page=1,
            body={
                'question1': {
                    'modified': '2019-01-01T00:00:00Z',
                    'value': 'foo',
                },
            },
        )

        return (team, user, cycle, response)

    def test_dashboard_forbidden(self):
        org = Organization.create(
            name='Org Foo',
            program_id=self.program.uid,
        )
        org.put()
        bad_admin = User.create(
            name='Bad Admin',
            email='bad@admin.com',
        )
        bad_admin.put()

        # 404
        self.testapp.get(
            '/api/organization_dashboards/{}'.format('Organization_dne'),
            headers=self.login_headers(bad_admin),
            status=404,
        )

        # 403
        self.testapp.get(
            '/api/organization_dashboards/{}'.format(org.uid),
            headers=self.login_headers(bad_admin),
            status=403,
        )

    def test_dashboard(self):
        org = Organization.create(
            name='Org Foo',
            program_id=self.program.uid,
        )
        org.put()
        org_admin = User.create(
            name='Org Admin',
            email='org@admin.com',
            owned_organizations=[org.uid],
        )
        org_admin.put()

        zipped = []
        for x in range(5):
            zipped.append(self.create_for_dashboard(org, x))
        teams, users, cycles, responses = zip(*zipped)

        Team.put_multi(teams)
        User.put_multi(users)
        Cycle.put_multi(cycles)
        Response.put_multi(responses)

        raw_result = self.testapp.get(
            '/api/organization_dashboards/{}'.format(org.uid),
            headers=self.login_headers(org_admin),
        )
        result = json.loads(raw_result.body)

        # Expected ids.
        team_ids = set(t.uid for t in teams)
        user_ids = set(u.uid for u in users)
        cycle_ids = set(c.uid for c in cycles)
        response_ids = set(r.uid for r in responses)

        # All ids present.
        self.assertEqual(set(t['uid'] for t in result['teams']), team_ids)
        self.assertEqual(set(u['uid'] for u in result['users']), user_ids)
        self.assertEqual(set(c['uid'] for c in result['cycles']), cycle_ids)
        self.assertEqual(
            set(r['uid'] for r in result['responses']), response_ids)

        # Responses have no body.
        self.assertTrue(all(len(r['body']) == 0 for r in result['responses']))
