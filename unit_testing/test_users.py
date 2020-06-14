"""Test user methods."""

import logging

from model import User, Classroom
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util


class TestUsers(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestUsers, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'user': User.get_table_definition(),
                'classroom': Classroom.get_table_definition(),
            })

    def test_get_main_contacts(self):
        contact1 = User.create(email="contact1@perts.net")
        contact2 = User.create(email="contact2@perts.net")
        contact1.put()
        contact2.put()

        classroom1 = Classroom.create(name="Foo", team_id="foo", code='a a',
                                      contact_id=contact1.uid)
        classroom2 = Classroom.create(name="Bar", team_id="bar", code='b b',
                                      contact_id=contact2.uid)

        contacts = User.get_main_contacts([classroom1, classroom2])
        self.assertEqual(set(contacts), {contact1, contact2})

    def test_get_empty_main_contacts(self):
        self.assertEqual(User.get_main_contacts([]), [])
