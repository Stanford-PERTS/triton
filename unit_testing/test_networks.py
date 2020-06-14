"""Test team methods."""

import logging
import unittest

from model import (
    InvalidNetworkAssociation,
    Network,
    Organization,
    Program,
    Team,
    User,
)
from unit_test_helper import ConsistencyTestCase
from permission import (
    is_supervisor_via_network,
    is_supervisor_of_team,
    has_captain_permission,
)
import mysql_connection


class TestNetworks(ConsistencyTestCase):
    program_label = 'ep18'
    ep_program = None

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestNetworks, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'network': Network.get_table_definition(),
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        ep_program = Program.create(
            name="Engagement Project",
            label=self.program_label,
            active=True,
            preview_url='foo.com',
        )
        self.ep_program = ep_program
        ep_program.put()

    def test_create(self):
        network = Network.create(
            name="Foo Network",
            program_id=self.ep_program.uid,
        )
        network.put()

        fetched = Network.get_by_id(network.uid)
        self.assertRegexpMatches(fetched.code, r'^[A-Z0-9]{6}$')
        self.assertEqual(fetched.association_ids, [])

    def test_self_reference_raises(self):
        self_reference = Network.create(
            name="Self-referencing Network",
            program_id=self.ep_program.uid,
        )
        self_reference.put()

        self_reference.association_ids = [self_reference.uid]
        with self.assertRaises(InvalidNetworkAssociation):
            self_reference.put()

    def test_circular_reference_raises(self):
        circular_reference_A = Network.create(
            name="A", program_id=self.ep_program.uid)
        circular_reference_B = Network.create(
            name="B", program_id=self.ep_program.uid)

        circular_reference_A.association_ids = [circular_reference_B.uid]
        circular_reference_B.association_ids = [circular_reference_A.uid]

        # This is fine b/c B doesn't point back here yet.
        circular_reference_A.put()

        # This should complete the circle and be broken.
        with self.assertRaises(InvalidNetworkAssociation):
            circular_reference_B.put()

    def create_for_permission(self):
        org = Organization.create(
            name="Foo Org", program_id=self.ep_program.uid)
        org.put()
        team = Team.create(name="Foo Team", program_id=self.ep_program.uid,
                           captain_id="User_cap", organization_ids=[org.uid])
        team.put()
        network = Network.create(
            name="Foo Network",
            program_id=self.ep_program.uid,
            association_ids=[org.uid]
        )
        meta_network = Network.create(
            name="Foo Network",
            program_id=self.ep_program.uid,
            association_ids=[network.uid]
        )
        Network.put_multi([network, meta_network])

        net_admin = User.create(email="net@admin.edu",
                                owned_networks=[network.uid])
        meta_admin = User.create(email="Meta@admin.edu",
                                 owned_networks=[meta_network.uid])
        User.put_multi([net_admin, meta_admin])

        return (meta_admin, net_admin, meta_network, network, org, team)

    def test_supervisor_permission(self):
        """Network admins get supervisor- and captain-like permission."""
        # The net_admin supervises the team via the org.
        # The meta_admin supervises the team via another network.
        (
            meta_admin, net_admin, meta_network, network, org, team
        ) = self.create_for_permission()

        self.assertTrue(is_supervisor_of_team(meta_admin, team))
        self.assertTrue(is_supervisor_via_network(meta_admin, team))
        self.assertTrue(has_captain_permission(meta_admin, team))

        self.assertTrue(is_supervisor_of_team(net_admin, team))
        self.assertTrue(is_supervisor_via_network(net_admin, team))
        self.assertTrue(has_captain_permission(net_admin, team))

    def test_networked_organization_ids(self):
        """List of networked orgs available in the user's client dict."""
        (
            meta_admin, net_admin, meta_network, network, org, team
        ) = self.create_for_permission()

        self.assertEqual(
            meta_admin.to_client_dict()['networked_organizations'],
            [org.uid]
        )
        self.assertEqual(
            net_admin.to_client_dict()['networked_organizations'],
            [org.uid]
        )
