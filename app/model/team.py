"""
Team
===========

Teams of users running a single survey together with their students.
"""
from google.appengine.api import memcache
import json
import logging

from model import (SqlModel, SqlField as Field, JsonTextValueLengthError,
                   JsonTextDictLengthError, JsonTextLengthError,
                   JSON_TEXT_VALUE_MAX, JSON_TEXT_DICT_MAX,
                   JSON_TEXT_MAX)
from .organization import Organization
from .program import Program
import mysql_connection
import util


class Team(SqlModel):
    table = 'team'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,               type,        length, unsigned, null,  default, on_update
            Field('uid',               'varchar',  50,     None,     False, None,    None),
            Field('short_uid',         'varchar',  50,     None,     False, None,    None),
            Field('created',           'datetime', None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',          'datetime', None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('name',              'varchar',  200,    None,     True,  SqlModel.sql_null,    None),
            Field('captain_id',        'varchar',  50,     None,     False, None,    None),
            # Enough for over a hundred different relationships.
            # @todo(chris): enforce some limit in the Organization class.
            Field('organization_ids',  'varchar',  3500,   None,     False, '[]',    None),
            Field('program_id',        'varchar',  50,     None,     False,  None,   None),
             # Also stored on Survey.
            Field('survey_reminders',  'bool',     None,   None,     False, 1,       None),
            Field('report_reminders',  'bool',     None,   None,     False, 1,       None),
            Field('target_group_name', 'varchar',  200,    None,     True,  SqlModel.sql_null, None),
            # N.B. text fields aren't searchable.
            # Also note this field defaults to a json dictionary in create().
            #   Aside: why not use a varchar and set a default in the db?
            #   Because this field may accept user text input, which might be
            #   quite long. Still, overly long input to one key in this dict
            #   could erase _other_ data saved in the structure, so
            #   before_put() checks it before storing.
            Field('task_data',         'text',     None,   None,     False, None,    None),
        ],
        'primary_key': ['uid'],
        'indices': [],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['organization_ids', 'task_data']

    default_cached_properties = {
        'num_classrooms': 0,
        'num_users': 0,
        'participation_base': 0,
    }

    @classmethod
    def create(klass, *args, **kwargs):
        team = super(klass, klass).create(*args, **kwargs)

        if team.task_data is None:
            team.task_data = {}

        return team

    @classmethod
    def query_by_name(klass, name, program_id=None):
        # N.B. **Not** using LIKE BINARY allows case-insensitive search.
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `name` LIKE %s
            {program_clause}
            ORDER BY `name`
        '''.format(
            table=klass.table,
            program_clause='AND `program_id` = %s' if program_id else ''
        )
        name_wildcard = '%{}%'.format(name)
        params = (name_wildcard, program_id) if program_id else (name_wildcard,)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_user(klass, user, program_id=None):
        if len(user.owned_teams) == 0:
            return []

        query = '''
            SELECT *
            FROM `{table}`
            WHERE `uid` IN ({ids}) {program_clause}
            ORDER BY `name`
        '''.format(
            table=klass.table,
            ids=','.join('%s' for uid in user.owned_teams),
            program_clause='AND `program_id` = %s' if program_id else ''
        )
        params = tuple(user.owned_teams + ([program_id] if program_id else []))

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_organization(klass, org_id):
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `organization_ids` LIKE BINARY %s
            ORDER BY `name`
        '''.format(table=klass.table)
        params = ('%{}%'.format(org_id),)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def get_cached_properties_from_db(self, team_id):
        """Count how many related users and classrooms there are.

        N.B. participation_base is not the number of unique students on the
        team. Rather it is the number of times we expect the survey to completed
        by students to reach 100% participation. Students who are in multiple
        classrooms are expected to complete the survey multiple times.
        """
        classroom_query = '''
            SELECT COUNT(`uid`) as num_classrooms
            ,      IFNULL(SUM(`num_students`), 0) as participation_base
            FROM   `classroom`
            WHERE  `team_id` = %s;
        '''
        classroom_params = (team_id,)

        user_query = '''
            SELECT COUNT(`uid`) as num_users
            FROM   `user`
            WHERE  `owned_teams` LIKE BINARY %s;
        '''
        user_params = ('%{}%'.format(team_id),)

        with mysql_connection.connect() as sql:
            classroom_rows = sql.select_query(classroom_query, classroom_params)
            user_rows = sql.select_query(user_query, user_params)

        if len(classroom_rows) > 1 or len(user_rows) > 1:
            raise Exception("Multiple results for team cached properties.")

        return {
            'num_classrooms': int(classroom_rows[0]['num_classrooms']),
            'participation_base': int(classroom_rows[0]['participation_base']),
            'num_users': int(user_rows[0]['num_users']),
        }


    @classmethod
    def update_cached_properties(klass, team_id):
        """If we find the team in the db, query for rel counts and cache."""
        from_db = Team.get_cached_properties_from_db(team_id)
        if from_db:
            memcache.set(util.cached_properties_key(team_id), from_db)
        return from_db

    def before_put(self, init_kwargs):
        if len(self.task_data) >= JSON_TEXT_DICT_MAX:
            raise JsonTextDictLengthError()

        for k, v in self.task_data.items():
            if len(json.dumps(v)) >= JSON_TEXT_VALUE_MAX:
                raise JsonTextValueLengthError()

        if len(json.dumps(self.task_data)) >= JSON_TEXT_MAX:
            raise JsonTextLengthError()

    def after_put(self, init_kwargs):
        """Reset memcache for related objects

        Include _all_ those the team is joining (e.g. on creation) as well as
        any the team is leaving.
        """
        rels = ((Organization, 'organization_ids'),)
        for model, attr in rels:
            original_ids = set(init_kwargs[attr])
            new_ids = set(getattr(self, attr))
            leaving_ids = original_ids.difference(new_ids)

            for uid in set(new_ids).union(leaving_ids):
                model.update_cached_properties(uid)

    def to_client_dict(self):
        d = super(Team, self).to_client_dict()

        # Decorate the team with counts of related objects; cached.
        d.update(self.default_cached_properties)

        cached = memcache.get(util.cached_properties_key(self.uid))
        if cached:
            d.update(cached)
        else:
            d.update(Team.update_cached_properties(self.uid))

        return d
