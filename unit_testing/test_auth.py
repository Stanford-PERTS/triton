"""Tests functions related to authentication."""

import logging
import webapp2
import webtest

from model import Classroom, Program, Team, User
from unit_test_helper import ConsistencyTestCase
import mysql_connection


class TestAuth(ConsistencyTestCase):
    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestAuth, self).set_up()

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

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def create(self):
        """Team owners can create classrooms with themselves as contact."""
        captain = User.create(email='captain@perts.net')
        contact = User.create(email='contact@perts.net')
        # other = User.create(email='other@perts.net')

        team = Team.create(name='Foo Team', captain_id=captain.uid,
                           program_id=self.program.uid)
        team.put()

        classroom = Classroom.create(name='Foo Classroom', team_id=team.uid,
                                     code='trout viper',
                                     contact_id=contact.uid)
        classroom.put()

        captain.owned_teams = [team.uid]
        captain.put()
        contact.owned_teams = [team.uid]
        contact.put()
        # other.put()

        # return team, classroom, captain, contact, other
        return team, classroom, captain, contact

    def test_resolve_mismatch(self):
        team, classroom, captain, contact = self.create()

        old_captain_id = captain.uid
        old_contact_id = contact.uid
        new_captain_id = 'User_newcaptain'
        new_contact_id = 'User_newcontact'

        captain = User.resolve_id_mismatch(captain, new_captain_id)
        contact = User.resolve_id_mismatch(contact, new_contact_id)

        self.assertEqual(captain.uid, new_captain_id)
        self.assertEqual(contact.uid, new_contact_id)

        fetched_captain = User.get_by_id(new_captain_id)
        fetched_contact = User.get_by_id(new_contact_id)

        self.assertIsNotNone(fetched_captain)
        self.assertIsNotNone(fetched_contact)

        fetched_team = Team.get_by_id(team.uid)
        self.assertEqual(fetched_team.captain_id, new_captain_id)

        fetched_classroom = Classroom.get_by_id(classroom.uid)
        self.assertEqual(fetched_classroom.contact_id, new_contact_id)
