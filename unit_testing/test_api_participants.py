"""Tests endpoints for participants."""

import datetime
import json
import logging
import unittest
import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Cycle, Participant, Program, Team, User
from unit_test_helper import ConsistencyTestCase, jwt_headers
import config
import mysql_connection
import util


class TestApiParticipants(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiParticipants, self).set_up()

        application = self.patch_webapp(webapp2.WSGIApplication)(
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
                'cycle': Cycle.get_table_definition(),
                'participant': Participant.get_table_definition(),
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

    def patch_webapp(self, WSGIApplication):
        """Webapp doesn't allow PATCH by default. See wsgi.py."""
        allowed = WSGIApplication.allowed_methods
        WSGIApplication.allowed_methods = allowed.union(('PATCH',))
        return WSGIApplication

    def create(self):
        team = Team.create(name='foo', program_id=self.program.uid)
        classroom = Classroom.create(
            name="CompSci 101",
            team_id=team.uid,
            code="foo",
        )

        teammate = User.create(name='teammate', email='mate@team.com',
                               owned_teams=[team.uid])
        contact = User.create(name='contact', email='contact@team.com',
                              owned_teams=[team.uid])
        captain = User.create(name='captain', email='captain@team.com',
                              owned_teams=[team.uid])
        other = User.create(name='other', email='other@else.com')

        team.captain_id = captain.uid
        classroom.contact_id = contact.uid

        # O hedgehog of curses, generate for the Finns a part of the game of
        # ignominies!
        # http://clagnut.com/blog/2380/
        participant = Participant.create(
            first_name=u'Je\u017cu',
            last_name=u'Kl\u0105tw',
            team_id=team.uid,
            classroom_ids=[classroom.uid],
            student_id=u'Kl\u0105tw@example.com',
        )

        participant.put()
        User.put_multi((other, teammate, contact, captain))
        team.put()
        classroom.num_students = 1
        classroom.put()

        return (other, teammate, contact, captain, team, classroom, participant)

    def test_get_requires_auth(self):
        response = self.testapp.get(
            '/api/participants',
            status=401,
        )

    def test_get_for_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/participants',
            status=401,
        )

    def test_get_for_classroom_requires_auth(self):
        response = self.testapp.get(
            '/api/classrooms/Classroom_foo/participants',
            status=401,
        )

    def test_get(self):
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        # Forbidden to see all participants.
        response = self.testapp.get(
            '/api/participants',
            headers=jwt_headers(other),
            status=403,
        )

        # Forbidden to see other-team participants.
        response = self.testapp.get(
            '/api/participants/{}'.format(ppnt.uid),
            headers=jwt_headers(other),
            status=403,
        )

        # Success for on-team participants.
        response = self.testapp.get(
            '/api/participants/{}'.format(ppnt.uid),
            headers=jwt_headers(teammate),
        )
        self.assertEqual(ppnt.uid, json.loads(response.body)['uid'])

    def test_check_roster(self):
        # Other apps (neptune) should be able to check the existence of
        # participants by name, and it should work on stripped versions.
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        ppnt.student_id = u'ABC-123-def'
        ppnt.stripped_student_id = 'abc123def'
        ppnt.put()
        url_code = classroom.code.replace(' ', '-')

        # Unstripped name found.
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(url_code, ppnt.student_id),
            status=200,
        )
        # Stripped name (expected neptune behavior) found.
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                url_code, ppnt.stripped_student_id),
            status=200,
        )
        # Unknown name not found.
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(url_code, 'dne'),
            status=404,
        )

        # Known name, unknown classroom code => not found.
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                'bad-code', ppnt.stripped_student_id),
            status=404,
        )

        # Known name and code, but student not on that classroom => not found.
        other_class = Classroom.create(
            name="Other Class",
            team_id=team.uid,
            contact_id='User_contact',
            code="bar",
        )
        other_class.put()
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                'bar', ppnt.stripped_student_id),
            status=404,
        )

        # Known name, but not on any classrooms => not found.
        disassociated = Participant.create(
            team_id=team.uid,
            classroom_ids=[],
            student_id='disassociated',
        )
        disassociated.put()
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                url_code, disassociated.stripped_student_id),
            status=404,
        )

    def test_check_roster_cycle_data(self):
        team = Team.create(name='foo', captain_id="User_cap",
                           program_id=self.program.uid)
        classroom = Classroom.create(
            name="CompSci 101",
            team_id=team.uid,
            contact_id="User_contact",
            code="foo bar",
            num_students=1,
        )
        ppt = Participant.create(
            team_id=team.uid,
            classroom_ids=[classroom.uid],
            student_id='STUDENTID001'
        )
        today = datetime.date.today()
        cycle1 = Cycle.create(
            team_id=team.uid,
            ordinal=1,
            # schedule to not be current (starts and ends in the past)
            start_date=today - datetime.timedelta(days=3),
            end_date=today - datetime.timedelta(days=2),
        )
        cycle1.put()

        team.put()
        classroom.put()
        ppt.put()

        # Without a current cycle, no cycle data
        response = self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                classroom.url_code, ppt.student_id),
            status=200,
        )
        self.assertEqual(
            json.loads(response.body),
            {'uid': ppt.uid, 'team_id': ppt.team_id},
        )

        # Add a new cycle that is current.
        cycle2 = Cycle.create(
            team_id=team.uid,
            ordinal=2,
            # schedule to not be current (starts and ends in the past)
            start_date=today - datetime.timedelta(days=1),
            end_date=today + datetime.timedelta(days=1),
        )
        cycle2.put()

        # Cycle data present.
        response = self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                classroom.url_code, ppt.student_id),
            status=200,
        )
        expected = {
            'uid': ppt.uid,
            'team_id': ppt.team_id,
            'cycle': {
                'uid': cycle2.uid,
                'team_id': cycle2.team_id,
                'ordinal': cycle2.ordinal,
                'start_date': util.datelike_to_iso_string(cycle2.start_date),
                'end_date': util.datelike_to_iso_string(cycle2.end_date),
            }
        }
        self.assertEqual(json.loads(response.body), expected)

    def test_update(self):
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        # Can't update for other classrooms.
        for user in (other, teammate):
            self.testapp.put_json(
                '/api/participants/{}'.format(ppnt.uid),
                {'student_id': 'Dave'},
                headers=jwt_headers(user),
                status=403,
            )

        # Success for contacts and captains.
        for user in (contact, captain):
            new_first = 'Dave-new'
            response = self.testapp.put_json(
                '/api/participants/{}'.format(ppnt.uid),
                {'student_id': new_first},
                headers=jwt_headers(user),
            )
            fetched = Participant.get_by_id(json.loads(response.body)['uid'])
            self.assertEqual(fetched.student_id, new_first)

    def test_update_remove_from_all(self):
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        # Updating to have no classrooms DOES NOT delete the participant and
        # updates classroom counts. We keep participants even if they're not on
        # any classrooms so that if they're re-added their uid (which must be
        # synced with Neptune) remains the same.
        self.testapp.put_json(
            '/api/participants/{}'.format(ppnt.uid),
            {'classroom_ids': []},
            headers=jwt_headers(captain),
        )
        fetched_ppnt = Participant.get_by_id(ppnt.uid)
        self.assertIsNotNone(fetched_ppnt)
        self.assertEqual(fetched_ppnt.classroom_ids, [])

        fetched_classroom = Classroom.get_by_id(classroom.uid)
        self.assertEqual(
            fetched_classroom.num_students, classroom.num_students - 1)

    def test_update_remove_from_multiple_rosters(self):
        """When ppt is updated to have one fewer classroom id."""
        other, teammate, contact, captain, team, classroom, _ = self.create()

        # Make a second classroom to associate with.
        classroom2 = Classroom.create(
            name="Second Classroom",
            team_id=team.uid,
            contact_id='User_contact',
            code="bar",
        )

        # Start with a ppt on two classrooms.
        ppnt = Participant.create(
            team_id=team.uid,
            classroom_ids=[classroom.uid, classroom2.uid],
            student_id='toremove',
        )
        ppnt.put()

        # Make sure count of students starts out correct.
        classroom2.num_students = 1
        classroom2.put()

        # Remove them from just one of their classrooms.
        response = self.testapp.put_json(
            '/api/participants/{}'.format(ppnt.uid),
            {'classroom_ids': [classroom.uid]},  # classroom2 removed
            headers=jwt_headers(contact),
        )

        # Check they're still on the other classroom.
        fetched = Participant.get_by_id(ppnt.uid)
        self.assertEqual(fetched.classroom_ids, [classroom.uid])

        # Check that classroom size is updated.
        fetched_classroom2 = Classroom.get_by_id(classroom2.uid)
        self.assertEqual(
            fetched_classroom2.num_students, classroom2.num_students - 1)

    def test_delete_not_supported(self):
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        # Not supported.
        for user in (other, teammate, contact, captain):
            self.testapp.delete(
                '/api/participants/{}'.format(ppnt.uid),
                headers=jwt_headers(user),
                status=405,
            )

    def test_get_for_team(self):
        """You can list participants for a team you own."""
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        # Forbidden for non-members.
        response = self.testapp.get(
            '/api/teams/{}/participants'.format(team.uid),
            headers=jwt_headers(other),
            status=403
        )

        # Make sure query excludes participants on other teams.
        other_ppnt = Participant.create(
            first_name='other',
            last_name='person',
            team_id='Team_foo',
            classroom_ids=['Classroom_foo'],
            student_id='STUDENTID001'
        )
        other_ppnt.put()

        # Successful for members.
        response = self.testapp.get(
            '/api/teams/{}/participants'.format(team.uid),
            headers=jwt_headers(teammate),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_for_classroom(self):
        """You can list participants for a team you own."""
        other, teammate, contact, captain, team, classroom, ppnt = self.create()

        # Forbidden for non-members.
        response = self.testapp.get(
            '/api/classrooms/{}/participants'.format(classroom.uid),
            headers=jwt_headers(other),
            status=403
        )

        # Make sure query excludes participants on other teams and classrooms.
        other_classroom = Classroom.create(code='foo', team_id=team.uid,
                                           contact_id='Lebowski')
        other_classroom.put()
        other_team_ppnt = Participant.create(
            first_name='team',
            last_name='team',
            team_id='Team_foo',
            classroom_ids=['Classroom_foo'],
            student_id='STUDENTID001',
        )
        other_class_ppnt = Participant.create(
            first_name='classroom',
            last_name='classroom',
            team_id=team.uid,
            classroom_ids=[other_classroom.uid],
            student_id='STUDENTID002'
        )
        Participant.put_multi([other_team_ppnt, other_class_ppnt])

        # Successful for members.
        response = self.testapp.get(
            '/api/classrooms/{}/participants'.format(classroom.uid),
            headers=jwt_headers(teammate),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_patch_batch(self):
        """custom PATCH handling: add a batch of participants"""
        (
            other, teammate, contact, captain, team, classroom, ppnt
        ) = self.create()

        class1ppt1 = {
            'first_name': u'Je\u017cu',
            'last_name': u'Kl\u0105tw',
            'team_id': team.uid,
            'classroom_id': classroom.uid,
            'student_id': 'Student_one',
        }
        class1ppt2 = {
            'first_name': u'Ppt',
            'last_name': u'One-Two',
            'team_id': team.uid,
            'classroom_id': classroom.uid,
            'student_id': 'Student_two',
        }
        class2ppt1 = {
            'first_name': u'Ppt',
            'last_name': u'Two-One',
            'team_id': team.uid,
            'classroom_id': 'Classroom_other',
            'student_id': 'Student_other',
        }

        def postBody(ppt, id_modifier=''):
            ppt = ppt.copy()
            ppt['student_id'] += id_modifier
            return {'method': 'POST', 'path': '/api/participants',
                    'body': ppt}

        # Can't create for other classrooms.
        for user in (other, teammate):
            self.testapp.patch_json(
                '/api/participants',
                [postBody(class1ppt1)],
                headers=jwt_headers(user),
                status=403,
            )

        # Can't create for mixed classrooms.
        self.testapp.patch_json(
            '/api/participants',
            [postBody(class1ppt1), postBody(class2ppt1)],
            headers=jwt_headers(captain),
            status=400,
        )

        # Success for contacts and captains.
        for user in (contact, captain):
            response = self.testapp.patch_json(
                '/api/participants',
                [
                    postBody(class1ppt1, user.uid),
                    postBody(class1ppt2, user.uid),
                ],
                headers=jwt_headers(user),
            )
            response_list = json.loads(response.body)
            self.assertEqual(len(response_list), 2)
            fetched1 = Participant.get_by_id(response_list[0]['uid'])
            fetched2 = Participant.get_by_id(response_list[1]['uid'])
            self.assertIsNotNone(fetched1)
            self.assertIsNotNone(fetched2)

        # `num_students` has incremented after adding new participant to
        # classroom.
        updated_classroom = Classroom.get_by_id(classroom.uid)
        self.assertEqual(
            updated_classroom.num_students,
            # two created by contact, and two by captain
            classroom.num_students + 2 + 2
        )

    def test_patch_with_existing_participants(self):
        """Custom PATCH handling: add a batch of participants, some of whom
        already exist in other classrooms."""
        (
            other, teammate, contact, captain, team, classroom, ppnt
        ) = self.create()

        extra_classroom = Classroom.create(
            name="Extra Classroom",
            code='foo',
            team_id=team.uid,
            contact_id=contact.uid,
        )
        extra_classroom.put()

        wrapper = {'method': 'POST', 'path': '/api/participants'}
        original_exact = {
            'team_id': team.uid,
            'classroom_id': extra_classroom.uid,
            'student_id': ppnt.student_id,
        }
        original_upper = {
            'team_id': team.uid,
            'classroom_id': extra_classroom.uid,
            'student_id': ppnt.student_id.upper(),
        }
        original_lower = {
            'team_id': team.uid,
            'classroom_id': extra_classroom.uid,
            'student_id': ppnt.student_id.lower(),
        }
        original_extra_characters = {
            'team_id': team.uid,
            'classroom_id': extra_classroom.uid,
            # Student tokens are stripped to alphanumerics only, so other
            # characters here should be ignored.
            'student_id': ppnt.student_id + '!',
        }
        new_ppnt = {
            'team_id': team.uid,
            'classroom_id': extra_classroom.uid,
            'student_id': 'Student_one',
        }

        response = self.testapp.patch_json(
            '/api/participants',
            [
                dict(wrapper, body=original_exact),
                dict(wrapper, body=original_upper),
                dict(wrapper, body=original_lower),
                dict(wrapper, body=new_ppnt),
            ],
            headers=jwt_headers(contact),
        )

        # There should now be a total of 2 participants, one of whom is in
        # two classrooms. All the differences in case should have been ignored.
        fetched_all = Participant.get()
        self.assertEqual(len(fetched_all), 2)

        fetched_original = next(p for p in fetched_all if p.uid == ppnt.uid)
        fetched_new = next(p for p in fetched_all if p.uid != ppnt.uid)
        self.assertIsNotNone(fetched_original)
        self.assertIsNotNone(fetched_new)
        self.assertEqual(
            set(fetched_original.classroom_ids),
            {classroom.uid, extra_classroom.uid},
        )
        self.assertEqual(
            set(fetched_new.classroom_ids),
            {extra_classroom.uid},
        )

    def test_patch_with_disassociated_participant(self):
        """If a participant exists with no classrooms, they are found."""
        other, teammate, contact, captain, team, classroom, _ = self.create()

        student_id = 'disassociated'

        # Add an participant who is disassociated from all classrooms.
        ppt = Participant.create(
            team_id=team.uid,
            classroom_ids=[],
            student_id=student_id,
        )
        ppt.put()

        def postBody(ppt, id_modifier=''):
            ppt = ppt.copy()
            ppt['student_id'] += id_modifier
            return {'method': 'POST', 'path': '/api/participants',
                    'body': ppt}

        response = self.testapp.patch_json(
            '/api/participants',
            [{
                'method': 'POST',
                'path': '/api/participants',
                'body': {
                    'team_id': team.uid,
                    'classroom_id': classroom.uid,
                    'student_id': student_id,
                },
            }],
            headers=jwt_headers(contact),
        )
        response_list = json.loads(response.body)

        # The provided student id matched the disassociated user and the
        # db used that uid.
        self.assertEqual(len(response_list), 1)
        self.assertEqual(response_list[0]['uid'], ppt.uid)
        self.assertEqual(
            Participant.get_by_id(ppt.uid).classroom_ids,
            [classroom.uid],
        )

        # `num_students` has incremented after adding new participant to
        # classroom.
        updated_classroom = Classroom.get_by_id(classroom.uid)
        self.assertEqual(
            updated_classroom.num_students,
            classroom.num_students + 1,
        )

    @unittest.skip('until I refactor mysql_api to use transactions properly')
    def test_batch_rollback(self):
        (
            other, teammate, contact, captain, team, classroom, ppnt
        ) = self.create()

        class1ppt1 = {
            'first_name': u'Je\u017cu',
            'last_name': u'Kl\u0105tw',
            'classroom_id': classroom.uid,
            'student_id': 'duplicateId',
        }
        class1ppt2 = {
            'first_name': u'Ppt',
            'last_name': u'One-Two',
            'classroom_id': classroom.uid,
            'student_id': 'duplicateId',
        }

        def postBody(ppt):
            return {'method': 'POST', 'path': '/api/participants',
                    'body': ppt}

        # Posting a duplicate should roll back the whole change.
        self.testapp.patch_json(
            '/api/participants',
            [postBody(class1ppt1), postBody(class1ppt2)],
            headers=jwt_headers(captain),
            status=400,
        )
        self.assertEqual(len(Participant.get()), 0)
