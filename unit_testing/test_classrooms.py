"""Test team methods."""

import logging
import unittest

from model import User, Classroom
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util
from google.appengine.api import memcache


class TestClassrooms(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestClassrooms, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'user': User.get_table_definition(),
                'classroom': Classroom.get_table_definition(),
            })

    def test_client_dict_has_default_contact_name(self):
        # Should work whether the contact is saved to the db or not.
        cl = Classroom.create(name="Classroom", team_id="Team_foo",
                              code="foo", contact_id="User_contact")

        # No matching user or unsaved class fails gracefully.
        before_dict = cl.to_client_dict()
        self.assertEqual(before_dict['contact_name'], '')

        cl.put()

        after_dict = cl.to_client_dict()
        self.assertEqual(after_dict['contact_name'], '')

    def test_initial_contact_name(self):
        cl = Classroom.create(name="Classroom", team_id="Team_foo", code="foo")
        user = User.create(email="contact@bar.com", name="Cleopatra")
        cl.contact_id = user.uid
        cl.put()
        user.put()

        # Handling the class for the client should populate memcache.
        self.assertEqual(cl.to_client_dict()['contact_name'], user.name)

        # Should see the value in the cache directly.
        cached = memcache.get(util.cached_properties_key(cl.uid))
        self.assertEqual(cached['contact_name'], user.name)

        return (cl, user)

    def test_change_contact_name(self):
        cl, user = self.test_initial_contact_name()

        # This should trigger a memcache update.
        user.name = 'Mark Antony'
        user.put()
        cached = memcache.get(util.cached_properties_key(cl.uid))
        self.assertEqual(cached['contact_name'], user.name)

        # Should see the same count on object.
        self.assertEqual(cl.to_client_dict()['contact_name'], user.name)

    def test_recovers_from_cache_miss(self):
        cl, user = self.test_initial_contact_name()

        memcache.flush_all()

        self.assertEqual(cl.to_client_dict()['contact_name'], user.name)
