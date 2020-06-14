"""Test rendering of emails."""

import codecs
import datetime
import logging

from model import Classroom, Cycle, format_to_addresses, Response, Team, User
from unit_test_helper import ConsistencyTestCase
import cycle_emailers

email_counter = 1

def save_email(email):
    global email_counter
    path = 'copilot_email_{}.html'.format(email_counter)
    with codecs.open(path, 'w', 'utf-8') as fh:
        fh.write(email.html)
    email_counter += 1

class TestEmails(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestEmails, self).set_up()

    def create(self):
        captain = User.create(email='cap@perts.net', name="Captain PERTS")
        teacher = User.create(email='teach@perts.net', name="Edward Teach")
        team = Team.create(name='Team Foo', program_id='Program_ep',
                           captain_id=captain.uid)
        classroom = Classroom.create(name='Class Foo', team_id=team.uid,
                                     contact_id=teacher.uid)
        cycle = Cycle.create(
            team_id=team.uid,
            ordinal=1,
            start_date=datetime.date.today() - datetime.timedelta(days=7),
            end_date=datetime.date.today() + datetime.timedelta(days=7),
        )

        captain.owned_teams = [team.uid]
        teacher.owned_teams = [team.uid]

        return (captain, teacher, team, classroom, cycle)

    def test_format_addresses_string(self):
        self.assertEqual(
            format_to_addresses('test@foo.com'),
            [{'email': 'test@foo.com', 'type': 'to'}]
        )

    def test_format_addresses_list(self):
        self.assertEqual(
            format_to_addresses(['test1@foo.com', 'test2@foo.com']),
            [
                {'email': 'test1@foo.com', 'type': 'to'},
                {'email': 'test2@foo.com', 'type': 'to'},
            ]
        )

    def test_format_addresses_cc_string(self):
        self.assertEqual(
            format_to_addresses('to@foo.com', 'cc@foo.com', 'bcc@foo.com'),
            [
                {'email': 'to@foo.com', 'type': 'to'},
                {'email': 'cc@foo.com', 'type': 'cc'},
                {'email': 'bcc@foo.com', 'type': 'bcc'},
            ]
        )

    def test_format_addresses_cc_list(self):
        self.assertEqual(
            format_to_addresses(
                ['to1@foo.com', 'to2@foo.com'],
                ['cc1@foo.com', 'cc2@foo.com'],
                ['bcc1@foo.com', 'bcc2@foo.com'],
            ),
            [
                {'email': 'to1@foo.com', 'type': 'to'},
                {'email': 'to2@foo.com', 'type': 'to'},
                {'email': 'cc1@foo.com', 'type': 'cc'},
                {'email': 'cc2@foo.com', 'type': 'cc'},
                {'email': 'bcc1@foo.com', 'type': 'bcc'},
                {'email': 'bcc2@foo.com', 'type': 'bcc'},
            ]
        )

    def user_module_response(self, cycle, user, module_label, progress=100):
        return Response.create(
            type=Response.USER_LEVEL_SYMBOL,
            user_id=user.uid,
            team_id=cycle.team_id,
            parent_id=cycle.uid,
            module_label=module_label,
            progress=progress,
            body={},
        )

    def team_module_response(self, cycle, module_label, progress=100):
        return Response.create(
            type=Response.TEAM_LEVEL_SYMBOL,
            user_id="",
            team_id=cycle.team_id,
            parent_id=cycle.uid,
            module_label=module_label,
            progress=progress,
            body={},
        )

    def test_ep_participation(self):
        captain, teacher, team, classroom, cycle = self.create()
        email = cycle_emailers.create_ep_email(
            'ep19',
            captain,
            [captain, teacher],
            team,
            [classroom],
            [],  # no responses,
            cycle,
            {classroom.uid: 55},
        )

        self.assertIn("55%", email.html)
        #save_email(email)

    def test_ep_no_classrooms(self):
        captain, teacher, team, classroom, cycle = self.create()
        email = cycle_emailers.create_ep_email(
            'ep19',
            captain,
            [captain, teacher],
            team,
            [],  # no classrooms
            [],  # no responses,
            cycle,
            {},  # no participation,
        )

        self.assertEqual(email.to_address, captain.email)
        self.assertIn(captain.name, email.html)
        self.assertIn('no-classrooms-message', email.html)
        #save_email(email)

    def test_ep_classrooms(self):
        captain, teacher, team, classroom, cycle = self.create()
        email = cycle_emailers.create_ep_email(
            'ep19',
            captain,
            [captain, teacher],
            team,
            [classroom],
            [],  # no responses,
            cycle,
            {},  # no participation,
        )

        self.assertIn('classrooms-list-{}'.format(classroom.uid), email.html)
        #save_email(email)

    def test_ep_captain_journal_status(self):
        captain, teacher, team, classroom, cycle = self.create()
        email = cycle_emailers.create_ep_email(
            'ep19',
            captain,
            [captain, teacher],
            team,
            [],
            [self.user_module_response(cycle, teacher, 'EPPracticeJournal')],
            cycle,
            {},  # no participation,
        )

        # Both users listed.
        self.assertIn(
            'journal-status-{}'.format(captain.uid),
            email.html
        )
        self.assertIn(
            'journal-status-{}'.format(teacher.uid),
            email.html
        )

        # One complete and one not.
        self.assertIn(
            '{name}: {status}'.format(name=captain.name, status="Incomplete"),
            email.html
        )
        self.assertIn(
            '{name}: {status}'.format(name=teacher.name, status="Complete"),
            email.html
        )
        #save_email(email)

    def test_ep_teacher_journal_not_done(self):
        captain, teacher, team, classroom, cycle = self.create()
        email = cycle_emailers.create_ep_email(
            'ep19',
            teacher,
            [captain, teacher],
            team,
            [],
            [],  # no responses
            cycle,
            {},  # no participation,
        )

        self.assertIn(teacher.name, email.html)
        self.assertIn('teacher-journal-incomplete', email.html)
        #save_email(email)

    def test_ep_teacher_journal_done(self):
        captain, teacher, team, classroom, cycle = self.create()
        email = cycle_emailers.create_ep_email(
            'ep19',
            teacher,
            [captain, teacher],
            team,
            [],
            [self.user_module_response(cycle, teacher, 'EPPracticeJournal')],
            cycle,
            {},  # no participation,
        )

        self.assertIn('teacher-journal-complete', email.html)
        #save_email(email)
