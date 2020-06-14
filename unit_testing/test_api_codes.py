"""Tests endpoints for codes."""

import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Participant, Program, Team
from unit_test_helper import ConsistencyTestCase
import config
import mysql_connection


class TestApiCodes(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiCodes, self).set_up()

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
                'team': Team.get_table_definition(),
            })

        self.program = Program.create(
            name="Engagement Project",
            label='ep18',
            min_cycles=3,
            active=True,
            preview_url='foo.com',
        )
        self.program.put()

    def test_status_code_not_found_returned_when_both(self):
        """404 Not Found is returned when both class and student_id doesn't exist."""
        self.testapp.get(
            '/api/codes/forest-temple/participants/zelda',
            status=404,
        )

    def test_status_code_not_found_returned_when_student_id(self):
        """404 Not Found is returned when class exists but student_id doesn't."""

        code = 'forest temple'
        student_id = 'zelda'
        bad_student_id = 'NOTzelda'

        team = Team.create(
            name="Foo Team",
            captain_id="User_cap",
            program_id=self.program.uid,
        )
        team.put()

        classroom = Classroom.create(
            code=code,
            name='Adventuring 101',
            contact_id='User_LINK',
            team_id=team.uid,
        )
        classroom.put()

        participant = Participant.create(
            student_id=student_id,
            team_id=team.uid,
            classroom_ids=[classroom.uid],
        )
        participant.put()

        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(code, bad_student_id),
            status=404,
        )

    def test_status_code_found_returned(self):
        """200 OK returned when student_id is found in classroom roster."""

        code = 'forest temple'
        student_id = 'Zelda 77!'

        team = Team.create(
            name="Foo Team",
            captain_id="User_cap",
            program_id=self.program.uid,
        )
        team.put()

        classroom = Classroom.create(
            code=code,
            name='Adventuring 101',
            contact_id='User_LINK',
            team_id=team.uid,
        )
        classroom.put()

        participant = Participant.create(
            student_id=student_id,
            team_id=team.uid,
            classroom_ids=[classroom.uid],
        )
        participant.put()

        # Exact match.
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(code, student_id),
            status=200,
        )

        # Stripped.
        self.testapp.get(
            '/api/codes/{}/participants/{}'.format(
                code, Participant.strip_token(student_id)),
            status=200,
        )
