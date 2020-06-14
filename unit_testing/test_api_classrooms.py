"""Tests endpoint /api/teams/X/classrooms.

Indirectly tests RelatedQuery with SqlModel. Other suites may skip handlers
naively inherit from the same code.
"""

import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Participant, Program, Report, Team, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection
import util


class TestApiClassrooms(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    program = None

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiClassrooms, self).set_up()

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
                'participant': Participant.get_table_definition(),
                'program': Program.get_table_definition(),
                'report': Report.get_table_definition(),
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

    def test_create(self):
        """Team owners can create classrooms with themselves as contact."""
        team = Team.create(name='Team Foo', captain_id='User_cap',
                           program_id=self.program.uid)
        team.put()
        user = User.create(name='User Foo', email='user@foo.com',
                           owned_teams=[team.uid])
        user.put()
        response = self.testapp.post_json(
            '/api/classrooms',
            {'name': 'Classroom Foo', 'team_id': team.uid, 'code': 'a a',
             'contact_id': user.uid},
            headers=self.login_headers(user),
        )
        # Make sure the response is right.
        response_dict = json.loads(response.body)
        classroom = Classroom.get_by_id(response_dict['uid'])
        self.assertEqual(
            response.body,
            json.dumps(classroom.to_client_dict(),
                       default=util.json_dumps_default),
        )
        # Make sure the contact is set.
        self.assertEqual(classroom.contact_id, user.uid)

        # Clear the user's cookie so we can use the app as other people.
        self.testapp.reset()
        return user, classroom

    def test_get_for_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/classrooms',
            status=401,
        )

    def test_get_for_team(self):
        """You can list classrooms for a team you own."""
        user, classroom = self.test_create()
        response = self.testapp.get(
            '/api/teams/{}/classrooms'.format(classroom.team_id),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_for_other_forbidden(self):
        """You can't list classrooms for someone else's team."""
        user, classroom = self.test_create()
        other = User.create(name='other', email='other@foo.com')
        other.put()
        response = self.testapp.get(
            '/api/teams/{}/classrooms'.format(classroom.team_id),
            headers=self.login_headers(other),
            status=403
        )

    def test_update_forbidden(self):
        contact, classroom = self.test_create()

        teammate = User.create(name='teammate', email='teammate@bar.com',
                               owned_teams=[classroom.team_id])
        teammate.put()

        self.testapp.put_json(
            '/api/classrooms/{}'.format(classroom.uid),
            {'contact_id': teammate.uid},  # try to steal contact
            headers=self.login_headers(teammate),
            status=403,
        )

    def test_delete_forbidden(self):
        """Only team captains can delete classrooms."""
        teammate = User.create(name='teammate', email='teammate@bar.com')
        other = User.create(name='other', email='other@bar.com')

        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.program.uid)
        team.put()

        teammate.owned_teams = [team.uid]
        User.put_multi([teammate, other])

        classroom = Classroom.create(
            name='Classroom Foo',
            code='trout viper',
            team_id=team.uid,
            contact_id='User_contact',
            num_students=22,
            grade_level='9-12',
        )
        classroom.put()

        for user in (teammate, other):
            self.testapp.delete(
                '/api/classrooms/{}'.format(classroom.uid),
                headers=self.login_headers(user),
                status=403,
            )

    def create_for_delete(self):
        """Should delete the classroom and associated reports."""
        contact = User.create(name='contact', email='contact@bar.com')
        captain = User.create(name='foo', email='foo@bar.com')

        team = Team.create(name='Team Foo', captain_id=captain.uid,
                           program_id=self.program.uid)
        team.put()

        captain.owned_teams = [team.uid]
        contact.owned_teams = [team.uid]
        User.put_multi([captain, contact])

        classroom = Classroom.create(
            name='Classroom Foo',
            code='trout viper',
            team_id=team.uid,
            contact_id=contact.uid,
            num_students=22,
            grade_level='9-12',
        )
        classroom.put()

        report1 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='report1.pdf',
            gcs_path='/upload/abc',
            size=10,
            content_type='application/pdf',
        )
        report1.put()

        report2 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='report2.pdf',
            gcs_path='/upload/def',
            size=10,
            content_type='application/pdf',
        )
        report2.put()

        return (captain, contact, classroom, report1, report2)

    def test_full_delete_by_captain(self):
        captain, contact, classroom, report1, report2 = \
            self.create_for_delete()

        url = '/api/classrooms/{}'.format(classroom.uid)
        headers = self.login_headers(captain)

        # Delete the classroom.
        self.testapp.delete(url, headers=headers, status=204)

        # Expect the classroom and related reports are gone from the db.
        self.assertIsNone(Classroom.get_by_id(classroom.uid))
        self.assertIsNone(Report.get_by_id(report1.uid))
        self.assertIsNone(Report.get_by_id(report2.uid))

        # Api should show a 404.
        self.testapp.get(url, headers=headers, status=404)
        self.testapp.delete(url, headers=headers, status=404)

    def test_delete_allowed_by_contact(self):
        # Same as above, just make sure contacts can do it, don't bother with
        # the exact same assertions.
        captain, contact, classroom, report1, report2 = \
            self.create_for_delete()

        url = '/api/classrooms/{}'.format(classroom.uid)
        headers = self.login_headers(contact)
        return self.testapp.delete(url, headers=headers, status=204)

    def test_delete_issues_allowed_endpoints_jwt(self):
        """DELETE response has special jwt giving permission on Neptune."""
        response = self.test_delete_allowed_by_contact()

        jwt = response.headers['Authorization'][7:]  # drop "Bearer "
        payload, error = jwt_helper.decode(jwt)
        self.assertEqual(
            payload['allowed_endpoints'],
            ['DELETE //neptune/api/codes/trout-viper'],
        )

    def test_delete_disassociates_participants(self):
        captain, contact, classroom1, report1, report2 = \
            self.create_for_delete()

        # Create another classroom, so we check that participants remain on it
        # afterward.
        classroom2 = Classroom.create(
            name='Classroom Bar',
            code='steel snake',
            team_id=classroom1.team_id,
            contact_id=contact.uid,
            num_students=22,
        )
        classroom2.put()

        ppt_on_one = Participant.create(
            student_id='on_one',
            team_id=classroom1.team_id,
            classroom_ids=[classroom1.uid],
        )
        ppt_on_two = Participant.create(
            student_id='on_two',
            team_id=classroom1.team_id,
            classroom_ids=[classroom1.uid, classroom2.uid],
        )
        Participant.put_multi([ppt_on_one, ppt_on_two])

        url = '/api/classrooms/{}'.format(classroom1.uid)
        headers = self.login_headers(captain)

        # Delete the classroom.
        self.testapp.delete(url, headers=headers, status=204)

        # Both participants are still there, but neither is associated with
        # the deleted classroom.
        self.assertEqual(
            Participant.get_by_id(ppt_on_one.uid).classroom_ids,
            []
        )
        self.assertEqual(
            Participant.get_by_id(ppt_on_two.uid).classroom_ids,
            [classroom2.uid]
        )

    def test_disallow_classroom_move(self):
        """Update the team_id of all class reports when class moves."""
        user = User.create(name='foo', email='foo@bar.com')

        team1 = Team.create(name='Team Foo', captain_id=user.uid,
                            program_id=self.program.uid)
        team1.put()

        team2 = Team.create(name='Team Bar', captain_id=user.uid,
                            program_id=self.program.uid)
        team2.put()

        user.owned_teams = [team1.uid, team2.uid]
        user.put()

        classroom = Classroom.create(
            name='Classroom Foo',
            code='trout viper',
            team_id=team1.uid,
            contact_id=user.uid,
            num_students=22,
            grade_level='9-12',
        )
        classroom.put()

        # move class to new team
        self.testapp.put_json(
            '/api/classrooms/{}'.format(classroom.uid),
            {'team_id': team2.uid},
            headers=self.login_headers(user),
            status=403,
        )
