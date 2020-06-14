"""Test team methods."""

import logging
import unittest

from model import Organization, Program, Team, User
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util
from google.appengine.api import memcache


class TestOrganizations(ConsistencyTestCase):
    program_label = 'ep18'
    ep_program = None

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestOrganizations, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
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

    def test_client_dict_has_default_rel_counts(self):
        # Should work whether the org is saved to the db or not.
        org = Organization.create(name="Organization", captain_id="User_cap",
                                  program_id=self.ep_program.uid)

        before_dict = org.to_client_dict()
        self.assertEqual(before_dict['num_teams'], 0)
        self.assertEqual(before_dict['num_users'], 0)

        org.put()

        after_dict = org.to_client_dict()
        self.assertEqual(after_dict['num_teams'], 0)
        self.assertEqual(after_dict['num_users'], 0)

    def test_creating_user_caches_rel_count(self):
        org = Organization.create(name="Organization", captain_id="User_cap",
                                  program_id=self.ep_program.uid)
        user = User.create(email="foo@bar.com", owned_organizations=[org.uid])
        org.put()

        # Populate memcache with the org's original value of 0 users.
        cached = Organization.update_cached_properties(org.uid)

        # This should trigger a memcache update.
        user.put()
        cached = memcache.get(util.cached_properties_key(org.uid))
        self.assertEqual(cached['num_users'], 1)

        # Should see the same count on object.
        self.assertEqual(org.to_client_dict()['num_users'], 1)

        return (org, user)

    def test_updating_user_caches_rel_count(self):
        org, user = self.test_creating_user_caches_rel_count()

        # This should trigger a memcache update.
        user.owned_organizations = []
        user.put()
        cached = memcache.get(util.cached_properties_key(org.uid))
        self.assertEqual(cached['num_users'], 0)

        # Should see the same count on object.
        self.assertEqual(org.to_client_dict()['num_users'], 0)

    def test_creating_team_caches_rel_count(self):
        org = Organization.create(name="Organization", captain_id="User_cap",
                                  program_id=self.ep_program.uid)
        team = Team.create(
            name="Team Foo", captain_id='User_cap', organization_ids=[org.uid],
            program_id=self.ep_program.uid,
        )
        org.put()

        # Populate memcache with the org's original value of 0 teams.
        cached = Organization.update_cached_properties(org.uid)

        # This should trigger a memcache update.
        team.put()
        cached = memcache.get(util.cached_properties_key(org.uid))
        self.assertEqual(cached['num_teams'], 1)

        # Should see the same count on object.
        self.assertEqual(org.to_client_dict()['num_teams'], 1)

        return (org, team)

    def test_updating_team_caches_rel_count(self):
        org, team = self.test_creating_team_caches_rel_count()

        # This should trigger a memcache update.
        team.organization_ids = []
        team.put()
        cached = memcache.get(util.cached_properties_key(org.uid))
        self.assertEqual(cached['num_teams'], 0)

        # Should see the same count on object.
        self.assertEqual(org.to_client_dict()['num_teams'], 0)

    def test_recovers_from_cache_miss(self):
        org, user = self.test_creating_user_caches_rel_count()

        memcache.flush_all()

        self.assertEqual(org.to_client_dict()['num_users'], 1)
