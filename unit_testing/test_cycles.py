# -*- coding: utf-8 -*-
"""Test generic model operations."""

import logging
from datetime import date, datetime, timedelta

from task_handlers import TeamCycleEmails
from model import Classroom, Cycle, Program, Response, Survey, Team, User
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util


class TestCycles(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestCycles, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
                'cycle': Cycle.get_table_definition(),
                'program': Program.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

    def test_reorders(self):
        """
        Cycles without dates are placed at the end ordered by ordinal.
        """
        cycles = [
            Cycle.create(
              team_id="Team_001",
              ordinal=1,
              start_date=None,
              end_date=None
            ),
            Cycle.create(
              team_id="Team_001",
              ordinal=2,
              start_date=None,
              end_date=None
            ),
            Cycle.create(
              team_id="Team_001",
              ordinal=3,
              start_date=date(2018, 1, 1),
              end_date=date(2019, 1, 1)
            ),
        ]
        reordered = Cycle.reorder_and_extend(cycles)
        self.assertEqual(reordered, [cycles[2], cycles[0], cycles[1]])

    def test_extended_end_dates_all_set(self):
        cycles = [
            Cycle.create(
              team_id="Team_001",
              ordinal=1,
              start_date=date(2019, 1, 1),
              end_date=date(2019, 1, 15)
            ),
            Cycle.create(
              team_id="Team_001",
              ordinal=2,
              start_date=date(2019, 2, 1),
              end_date=date(2019, 2, 15)
            ),
            Cycle.create(
              team_id="Team_001",
              ordinal=3,
              start_date=date(2019, 3, 1),
              end_date=date(2019, 3, 15)
            ),
        ]
        reordered = Cycle.reorder_and_extend(cycles)
        self.assertEqual(
            reordered[0].extended_end_date,
            date(2019, 1, 31),  # day before 2/1
        )
        self.assertEqual(
            reordered[1].extended_end_date,
            date(2019, 2, 28),  # day before 3/1
        )
        self.assertEqual(
            reordered[2].extended_end_date,
            date(2019, 6, 30)  # last day of program
        )

    def test_extended_end_dates_some_unset(self):
        cycles = [
            Cycle.create(
              team_id="Team_001",
              ordinal=1,
              start_date=date(2019, 1, 1),
              end_date=date(2019, 1, 15)
            ),
            Cycle.create(
              team_id="Team_001",
              ordinal=2,
              start_date=None,
              end_date=None,
            ),
            Cycle.create(
              team_id="Team_001",
              ordinal=3,
              start_date=None,
              end_date=None,
            ),
        ]

        # Should match output of Cycle.cycleless_end_date().
        last_day_of_program = date(2019, 6, 30)

        reordered = Cycle.reorder_and_extend(cycles)
        self.assertEqual(reordered[0].extended_end_date, last_day_of_program)
        self.assertEqual(reordered[1].extended_end_date, None)
        self.assertEqual(reordered[2].extended_end_date, None)

    def test_get_current_no_extended_end_date(self):
        team_id = 'Team_001'
        strictly_past_cycle = Cycle.create(
          team_id=team_id,
          ordinal=1,
          start_date=date.today() - timedelta(days=2),
          end_date=date.today() - timedelta(days=1),
        )
        strictly_past_cycle.put()
        strictly_current_cycle = Cycle.create(
          team_id=team_id,
          ordinal=2,
          start_date=date.today() - timedelta(days=1),
          end_date=date.today() + timedelta(days=1),
        )
        strictly_current_cycle.put()
        strictly_future_cycle = Cycle.create(
          team_id=team_id,
          ordinal=3,
          start_date=date.today() + timedelta(days=1),
          end_date=date.today() + timedelta(days=2),
        )
        strictly_future_cycle.put()

        self.assertEqual(
            Cycle.get_current_for_team(team_id),
            strictly_current_cycle
        )

    def test_get_current_with_extended_end_date(self):
        team_id = 'Team_001'
        extended_current_cycle = Cycle.create(
          team_id=team_id,
          ordinal=1,
          start_date=date.today() - timedelta(days=2),
          end_date=date.today() - timedelta(days=1),
          extended_end_date=date.today() + timedelta(days=1),
        )
        extended_current_cycle.put()
        strictly_future_cycle = Cycle.create(
          team_id=team_id,
          ordinal=2,
          start_date=date.today() + timedelta(days=2),
          end_date=date.today() + timedelta(days=3),
        )
        strictly_future_cycle.put()

        self.assertEqual(
            Cycle.get_current_for_team(team_id),
            extended_current_cycle
        )
