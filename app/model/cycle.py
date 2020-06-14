"""
Cycle
===========

Cycles of users running a single survey together with their students.

# Note on dates

Cycles have user-set start and end dates to help them schedule their
activities. These are always the dates use for display.

The extended end date is derived from the whole set of a team's cycles in order
to calculate the most intuitive window to use when associating responses to
cycles. Before introducing this date, responses that fell between or after
the last cycle weren't captured in any Copilot data. This unnecessarily
penalizes users. With the extended end date used for participation queries,
all late participation is attributed to the previous cycle.

"""
import datetime
import logging
import util

from model import SqlModel, SqlField as Field
from .program import Program
import config
import mysql_connection


class Cycle(SqlModel):
    table = 'cycle'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,               type,      length, unsigned, null,  default, on_update
            Field('uid',              'varchar',  50,     None,     False, None,    None),
            Field('short_uid',        'varchar',  50,     None,     False, None,    None),
            Field('created',          'datetime', None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',         'datetime', None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('team_id',          'varchar',  50,     None,     False, None,    None),
            Field('ordinal',          'tinyint',  4,      True,     False, 1,       None),
            Field('start_date',       'date',     None,   None,     True,  SqlModel.sql_null, None),
            Field('end_date',         'date',     None,   None,     True,  SqlModel.sql_null, None),
            Field('extended_end_date','date',     None,   None,     True,  SqlModel.sql_null, None),
            Field('meeting_datetime', 'datetime', None,   None,     True,  SqlModel.sql_null,None),
            Field('meeting_location', 'varchar',  200,    None,     True,  None,    None),
            Field('resolution_date',  'date',     None,   None,     True,  SqlModel.sql_null, None),
            # Represents _current_ participation, based on the active cycle.
            Field('students_completed','smallint',5,      True,     True,  SqlModel.sql_null, None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'name': 'team',
                'fields': ['team_id'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    @classmethod
    def cycleless_start_date(klass, current_date=None):
        # Returns the previous July 1
        if current_date is None:
            current_date = datetime.date.today()

        current_year = current_date.year
        current_month = current_date.month
        july_month = 7

        start_date_month = july_month
        start_date_day = 1

        if current_month < july_month:
            start_date_year = current_year - 1
        else:
            start_date_year = current_year

        return datetime.date(
            start_date_year,
            start_date_month,
            start_date_day
        )

    @classmethod
    def cycleless_end_date(klass, current_date=None):
        # Returns the next June 30
        if current_date is None:
            current_date = datetime.date.today()

        current_year = current_date.year
        current_month = current_date.month
        june_month = 6

        end_date_month = june_month
        end_date_day = 30

        if current_month > june_month:
            end_date_year = current_year + 1
        else:
            end_date_year = current_year

        return datetime.date(
            end_date_year,
            end_date_month,
            end_date_day
        )

    @classmethod
    def create_for_team(klass, team):
        program = Program.get_by_id(team.program_id)

        if not program:
            return []

        if not program.use_cycles:
            # https://github.com/PERTS/triton/issues/1632
            # The program is in cycleless mode. Generate a single cycle with
            # date range from previous July 1 through the next June 30.
            today = datetime.date.today()
            start_date = klass.cycleless_start_date(today)
            end_date = klass.cycleless_end_date(today)

            return [
                Cycle.create(
                    team_id=team.uid,
                    ordinal=1,
                    start_date=start_date,
                    end_date=end_date
                )
            ]

        return [Cycle.create(team_id=team.uid, ordinal=x + 1)
                for x in range(program.min_cycles or 0)]

    @classmethod
    def get_current_for_team(klass, team_id, today=None):
        """Returns current cycle or None."""
        if today is None:
            today = datetime.date.today()
        today_str = today.strftime(config.sql_datetime_format)

        query = '''
            SELECT *
            FROM `{table}`
            WHERE `team_id` = %s
              AND `start_date` <= %s
              AND (
                `end_date` >= %s OR
                `extended_end_date` >= %s
              )
            LIMIT 1
        '''.format(table=klass.table)
        params = (team_id, today_str, today_str, today_str)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return klass.row_dict_to_obj(row_dicts[0]) if row_dicts else None

    @classmethod
    def query_by_teams(klass, team_ids):
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `team_id` IN ({interps})
        '''.format(
            table=klass.table,
            interps=', '.join(['%s'] * len(team_ids))
        )
        params = tuple(team_ids)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(r) for r in row_dicts]

    @classmethod
    def reorder_and_extend(klass, team_cycles):
        """Order cycles within a team by date and adds extended_end_date.

        Cycles without dates are placed at the end ordered by ordinal.

        Raises if dates overlap.

        Returns cycles, likely modified/mutated. N.B. non-pure!
        """
        if len(team_cycles) == 0:
            return []

        if not len(set(c.team_id for c in team_cycles)) == 1:
            raise Exception("Got cycles from multiple teams: {}"
                            .format(team_cycles))

        # Sort and apply ordinals.
        dated = [c for c in team_cycles if c.start_date]
        undated = [c for c in team_cycles if not c.start_date]

        ordered_dated = sorted(dated, key=lambda c: c.start_date)
        ordered_undated = sorted(undated, key=lambda c: c.ordinal)
        ordered = ordered_dated + ordered_undated
        for i, cycle in enumerate(ordered):
            new_ordinal = i + 1
            if cycle.ordinal != new_ordinal:
                cycle.ordinal = new_ordinal

            # Sanity-check all but the last for date overlap.
            if i == len(ordered) - 1:
                break

            next_cycle = ordered[i + 1]
            dates_set = bool(cycle.end_date and next_cycle.start_date)
            if dates_set and cycle.end_date >= next_cycle.start_date:
                raise Exception("Cycle dates overlap: {}, {}"
                                .format(cycle, next_cycle))

        ordered = klass.extend_dates(ordered)

        return ordered

    @classmethod
    def extend_dates(klass, team_cycles):
        # When we need to figure out the end of the current program, do it
        # relative to the beginning of the first cycle.
        program_end_date = klass.cycleless_end_date(team_cycles[0].start_date)

        for i, cycle in enumerate(team_cycles):
            if not cycle.start_date or not cycle.end_date:
                # Cycles should come in order, and if dates aren't set on this
                # one then none of the later cycles have dates set either.
                # Don't add any extended dates to this or any later cycles.
                cycle.extended_end_date = None
                continue

            if i + 1 < len(team_cycles):
                # There's a next cycle. Attempt to extend the end date to the
                # that next cycle.
                next_cycle = team_cycles[i + 1]
                if next_cycle.start_date:
                    cycle.extended_end_date = (next_cycle.start_date -
                                               datetime.timedelta(days=1))
                else:
                    # The next cycle doesn't have dates defined; extend the
                    # end date to the latest possible day.
                    cycle.extended_end_date = program_end_date
            else:
                # This is the last cycle; extend the end date to latest
                # possible day.
                cycle.extended_end_date = program_end_date

        return team_cycles
