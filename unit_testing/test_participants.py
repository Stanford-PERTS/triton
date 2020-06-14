"""Test participant methods."""

import logging

from cron_handlers import ReleasePreviews
from model import Participant
from unit_test_helper import ConsistencyTestCase
import MySQLdb
import mysql_connection
import util


class TestParticipants(ConsistencyTestCase):

    def set_up(self):
        super(TestParticipants, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'participant': Participant.get_table_definition(),
            })

    def create(self):
        team_id = 'Team_001'
        p1 = Participant.create(
            student_id='4321',
            team_id=team_id,
            classroom_ids=['Classroom_001'],
        )
        p2 = Participant.create(
            student_id='4322',
            team_id=team_id,
            classroom_ids=['Classroom_001', 'Classroom_002'],
        )
        p3 = Participant.create(
            student_id='4323',
            team_id=team_id,
            classroom_ids=['Classroom_003'],
        )
        Participant.put_multi([p1, p2, p3])

        return p1, p2, p3

    def test_get_for_classroom(self):
        p1, p2, p3 = self.create()

        ppts = Participant.get_for_classroom(p1.team_id, 'Classroom_001')
        self.assertEqual({p1.uid, p2.uid}, set(p.uid for p in ppts))

    def test_get_for_classroom_with_ids(self):
        p1, p2, p3 = self.create()

        ppts = Participant.get_for_classroom(
            p1.team_id,
            'Classroom_001',
            student_ids=[p1.student_id],
        )
        self.assertEqual([p1], ppts)

    def test_get_for_team(self):
        p1, p2, p3 = self.create()

        ppts = Participant.get_for_team(p1.team_id)
        self.assertEqual(len(ppts), 3)

    def test_get_for_team_with_ids(self):
        p1, p2, p3 = self.create()

        ppts = Participant.get_for_team(
            p1.team_id,
            student_ids=[p1.student_id],
        )
        self.assertEqual([p1], ppts)
