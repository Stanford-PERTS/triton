"""Test team methods."""

import logging
import unittest

from model import Classroom, Program, Team, User
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util
from google.appengine.api import memcache


class TestTeams(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestTeams, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
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

    def test_client_dict_has_default_rel_counts(self):
        # Should work whether the team is saved to the db or not.
        team = Team.create(name="Team", captain_id="User_cap",
                           program_id=self.program.uid)

        before_dict = team.to_client_dict()
        self.assertEqual(before_dict['num_classrooms'], 0)
        self.assertEqual(before_dict['num_users'], 0)
        self.assertEqual(before_dict['participation_base'], 0)

        team.put()

        after_dict = team.to_client_dict()
        self.assertEqual(after_dict['num_classrooms'], 0)
        self.assertEqual(after_dict['num_users'], 0)
        self.assertEqual(after_dict['participation_base'], 0)

    def test_creating_user_caches_rel_count(self):
        team = Team.create(name="Team", captain_id="User_cap",
                           program_id=self.program.uid)
        user = User.create(email="foo@bar.com", owned_teams=[team.uid])
        team.put()

        # Populate memcache with the team's original value of 0 users.
        cached = Team.update_cached_properties(team.uid)

        # This should trigger a memcache update.
        user.put()
        cached = memcache.get(util.cached_properties_key(team.uid))
        self.assertEqual(cached['num_users'], 1)

        # Should see the same count on object.
        self.assertEqual(team.to_client_dict()['num_users'], 1)

        return (team, user)

    def test_updating_user_caches_rel_count(self):
        team, user = self.test_creating_user_caches_rel_count()

        # This should trigger a memcache update.
        user.owned_teams = []
        user.put()
        cached = memcache.get(util.cached_properties_key(team.uid))
        self.assertEqual(cached['num_users'], 0)

        # Should see the same count on object.
        self.assertEqual(team.to_client_dict()['num_users'], 0)

    def test_creating_classroom_caches_rel_count(self):
        team = Team.create(name="Team", captain_id="User_cap",
                           program_id=self.program.uid)
        classroom = Classroom.create(
            name="Class Foo", code='trout viper', team_id=team.uid,
            contact_id='User_contact',
        )
        team.put()

        # Populate memcache with the team's original value of 0 classrooms.
        cached = Team.update_cached_properties(team.uid)

        # This should trigger a memcache update.
        classroom.put()
        cached = memcache.get(util.cached_properties_key(team.uid))
        self.assertEqual(cached['num_classrooms'], 1)

        # Should see the same count on object.
        self.assertEqual(team.to_client_dict()['num_classrooms'], 1)

        return (team, classroom)

    def test_updating_classroom_caches_rel_count(self):
        team, classroom = self.test_creating_classroom_caches_rel_count()

        # Change the number of students. This should trigger a memcache update.
        classroom.num_students = 5
        classroom.put()
        cached = memcache.get(util.cached_properties_key(team.uid))
        self.assertEqual(cached['participation_base'], 5)

        # Should see the same count on object.
        self.assertEqual(team.to_client_dict()['participation_base'], 5)

    def test_recovers_from_cache_miss(self):
        team, user = self.test_creating_user_caches_rel_count()

        memcache.flush_all()

        self.assertEqual(team.to_client_dict()['num_users'], 1)

    def test_default_task_data(self):
        team = Team.create(name="Team", captain_id="User_cap",
                           program_id=self.program.uid)

        self.assertEqual(team.task_data, {})
