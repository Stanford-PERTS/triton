"""
Classroom
===========

Classrooms of students taught by teachers on a team.
"""
from google.appengine.api import memcache
import logging

from model import SqlModel, SqlField as Field
from .team import Team
import mysql_connection
import util


class Classroom(SqlModel):
    table = 'classroom'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('name',          'varchar', 200,    None,     True,  SqlModel.sql_null,    None),
            Field('team_id',       'varchar', 50,     None,     False, None,    None),
            Field('code',          'varchar', 50,     None,     False, None,    None),
            Field('contact_id',    'varchar', 50,     None,     False, None,    None),
            Field('num_students',  'smallint',5,      True,     False, 0,       None),
            Field('grade_level',   'varchar', 50,     None,     True,  SqlModel.sql_null,    None),
        ],
        'primary_key': ['uid'],
        'indices': [],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    default_cached_properties = {
        'contact_name': '',
        'contact_email': '',
    }

    @property
    def url_code(self):
        return self.code.replace(' ', '-')

    @classmethod
    def query_by_name(klass, name, program_id=None):
        # N.B. **Not** using LIKE BINARY allows case-insensitive search.
        query = '''
            SELECT c.*, t.`name` as team_name
            FROM classroom c
            JOIN team t
                ON c.`team_id` = t.`uid`
            WHERE c.`name` LIKE %s
            {program_clause}
            ORDER BY c.`name`
        '''.format(
            program_clause='AND t.`program_id` = %s' if program_id else ''
        )
        name_wildcard = '%{}%'.format(name)
        params = (name_wildcard, program_id) if program_id else (name_wildcard,)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_contact(klass, user, program_id=None):
        query = '''
            SELECT c.*, t.`name` as team_name
            FROM classroom c
            JOIN team t
                ON c.`team_id` = t.`uid`
            WHERE c.`contact_id` = %s
            {program_clause}
            ORDER BY c.`name`
        '''.format(
            program_clause='AND t.`program_id` = %s' if program_id else ''
        )
        params = (user.uid, program_id) if program_id else (user.uid,)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def get_by_program(klass, program_id):
        """Db query to get classrooms on teams in a program, uses a JOIN."""
        query = '''
            SELECT c.*
            FROM `classroom` c
            JOIN `team` t
              ON c.`team_id` = t.`uid`
            WHERE t.`program_id` = %s
        '''
        params = (program_id,)

        with mysql_connection.connect() as sql:
            results = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in results]

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
    def get_cached_properties_from_db(self, classroom_id):
        """What's the name of the main contact?"""
        query = '''
            SELECT
                u.`name` as name,
                u.`email` as email
            FROM `classroom` c
            JOIN `user` u
              ON c.`contact_id` = u.`uid`
            WHERE c.`uid` = %s
        '''
        params = (classroom_id,)

        with mysql_connection.connect() as sql:
            rows = sql.select_query(query, params)

        if len(rows) == 1:
            return {
                'contact_name': rows[0]['name'],
                'contact_email': rows[0]['email'],
            }
        return {}

    @classmethod
    def update_cached_properties(klass, classroom_id):
        from_db = Classroom.get_cached_properties_from_db(classroom_id)
        if from_db:
            memcache.set(util.cached_properties_key(classroom_id), from_db)
        return from_db

    @classmethod
    def get_by_code(klass, code):
        classrooms = Classroom.get(code=code)
        return classrooms[0] if classrooms else None

    def after_put(self, init_kwargs):
        """Update cached properties in response to classrooms changing.

        * Team's number of classrooms
        * Classroom's contact name and email
        """
        original_contact_id = init_kwargs['contact_id']
        if self.contact_id != original_contact_id:
            Classroom.update_cached_properties(self.uid)
        Team.update_cached_properties(self.team_id)

    def to_client_dict(self):
        """Decorate the team with counts of related objects; cached."""
        d = super(Classroom, self).to_client_dict()

        # If the team name is available (returned by some custom queries),
        # ndb's to_dict() will exclude it. Put it back so we can use it.
        if hasattr(self, 'team_name'):
            d['team_name'] = self.team_name

        d.update(self.default_cached_properties)

        cached = memcache.get(util.cached_properties_key(self.uid))
        if cached:
            d.update(cached)
        else:
            d.update(Classroom.update_cached_properties(self.uid))

        return d
