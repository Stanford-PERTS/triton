"""Test endpoints /api/networks/X and /api/users/X/networks.

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
from model import Network, Organization, Program, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiNetworks(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiNetworks, self).set_up()

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
                'network': Network.get_table_definition(),
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
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
        response = self.testapp.get('/api/networks', status=401)

    def test_get_own_requires_auth(self):
        response = self.testapp.get('/api/users/User_foo/networks', status=401)

    def test_get_all_forbidden(self):
        """Non-supers get 403."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/networks',
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_all_super(self):
        """Supers can query all networks."""
        network = Network.create(name='Foo Net', program_id=self.program.uid)
        network.put()
        super_admin = User.create(name='super', email='super@bar.com',
                                  user_type='super_admin')
        super_admin.put()
        response = self.testapp.get(
            '/api/networks',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def create_for_paging(self, n):
        # Pad numeric names so they sort alphabetically.
        networks = [
            Network.create(
                name=str(x).rjust(2, '0'), program_id=self.program.uid)
            for x in range(n)
        ]
        Network.put_multi(networks)
        super_admin = User.create(name='super', email='super@bar.com',
                                 user_type='super_admin')
        super_admin.put()

        return networks, super_admin

    def test_get_first_page(self):
        networks, super_admin = self.create_for_paging(20)

        response = self.testapp.get(
            '/api/networks?n=10',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)

        # We should have the first 10 results, in alphabetical order.
        self.assertEqual([n.uid for n in networks[:10]],
                         [n['uid'] for n in response_list])

    def test_get_offset_page(self):
        networks, super_admin = self.create_for_paging(20)

        response = self.testapp.get(
            '/api/networks?n=10&cursor=11',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)

        # We should have results 11-20, in order.
        self.assertEqual([n.uid for n in networks[11:]],
                         [n['uid'] for n in response_list])

    def test_link_header(self):
        # 5 networks for first, previous, current, next, and last.
        networks, super_admin = self.create_for_paging(5)

        response = self.testapp.get(
            '/api/networks?n=1&cursor=2',
            headers=self.login_headers(super_admin),
        )
        self.assertEqual(
            response.headers['Link'],
            '</api/networks?n=1&cursor=2&order=name>;rel=self,'
            '</api/networks?order=name&n=1>;rel=first,'
            '</api/networks?cursor=1&order=name&n=1>;rel=previous,'
            '</api/networks?cursor=3&order=name&n=1>;rel=next,'
            '</api/networks?cursor=4&order=name&n=1>;rel=last',
        )

    def test_link_header_for_program(self):
        """Links header should work when filtering to program"""
        program_cset = Program.create(
            name="CSET",
            label="cset19",
            preview_url='foo.com',
        )
        program_cset.put()

        cset_net = Network.create(
            name="cset Network",
            program_id=program_cset.uid
        )
        cset_net.put()
        ep_nets, super_admin = self.create_for_paging(12)

        # cset only has 1 organization, so no paging past first page.
        response = self.testapp.get(
            '/api/networks?program_id={}&n=10'.format(program_cset.uid),
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
            ).format(path='/api/networks', pid=program_cset.uid)
        )

        # EP has 12 networks, so there is paging past first page.
        response = self.testapp.get(
            '/api/networks?program_id={}&n=10'.format(self.program.uid),
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
            ).format(path='/api/networks', pid=self.program.uid)
        )

    def test_get_all_for_self(self):
        """You can list your own networks."""
        network = Network.create(name='foo', program_id=self.program.uid)
        network.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_networks=[network.uid])
        user.put()
        response = self.testapp.get(
            '/api/users/{}/networks'.format(user.uid),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_owned(self):
        """You can get a network you own."""
        network = Network.create(name='foo', program_id=self.program.uid)
        network.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_networks=[network.uid])
        user.put()
        response = self.testapp.get(
            '/api/networks/{}'.format(network.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['uid'], network.uid)

    def test_get_for_other_forbidden(self):
        """You can't list someone else's networks."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/users/User_other/networks',
            headers=self.login_headers(user),
            status=403
        )

    def test_create(self):
        """Anyone can create a network."""
        network_name = 'Foo Net'
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.post_json(
            '/api/networks',
            {'name': network_name, 'program_id': self.program.uid},
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['name'], network_name)

        fetched_network = Network.get_by_id(response_dict['uid'])
        self.assertIsNotNone(fetched_network)

        # Remove user's cookie so we can use the test app as other people.
        self.testapp.reset()
        return user, response_dict

    def test_change_code_requires_auth(self):
        response = self.testapp.post(
            '/api/networks/{}/code',
            status=401,
        )

    def test_change_code(self):
        network = Network.create(name='Foo Org', program_id=self.program.uid)
        network.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_networks=[network.uid])
        user.put()

        response = self.testapp.post(
            '/api/networks/{}/code'.format(network.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)

        self.assertEqual(response_dict['uid'], network.uid)
        self.assertIsNotNone(response_dict['code'])
        self.assertNotEqual(response_dict['code'], network.code)

    def test_change_code_forbidden(self):
        network = Network.create(name='Foo Net', program_id=self.program.uid)
        network.put()
        other = User.create(name='other', email='other@bar.com',
                            owned_networks=[])
        other.put()

        response = self.testapp.post(
            '/api/networks/{}/code'.format(network.uid),
            headers=self.login_headers(other),
            status=403,
        )

    def test_delete(self):
        """Networks can be deleted, and owners are disassociated."""
        network = Network.create(name='Foo Org', program_id=self.program.uid)
        network.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_networks=[network.uid])
        user.put()

        self.testapp.delete(
            '/api/networks/{}'.format(network.uid),
            headers=self.login_headers(user),
            status=204,
        )

        self.assertIsNone(Network.get_by_id(network.uid))

        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(fetched_user.owned_networks, [])