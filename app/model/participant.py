"""
Participant
===========

Complement to a Neptune participant, scoped to a classroom.
"""
import logging
import re
import unicodedata

from model import SqlModel, SqlField as Field
import mysql_connection


class Participant(SqlModel):
    table = 'participant'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            # School's internal, unique, ID
            Field('student_id',    'varchar', 100,     None,     False, None,    None),
            Field('stripped_student_id', 'varchar', 100, None,  False, None,    None),
            Field('team_id',       'varchar', 50,     None,     False, None,    None),
            Field('classroom_ids', 'varchar', 3500,   None,     False, None,    None),
            Field('in_target_group','bool',   None,   None,     False, 0,       None),
        ],
        'primary_key': ['uid'],
        'indices': [
            # Student ID should be unique to a Team
            {
                'name': 'team-student',
                'fields': ['team_id', 'stripped_student_id'],
                'unique': True,
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['classroom_ids']

    @classmethod
    def create(klass, **kwargs):
        kwargs['stripped_student_id'] = klass.strip_token(kwargs['student_id'])
        return super(klass, klass).create(**kwargs)

    @classmethod
    def strip_name(klass, s):
        """Returns lowercase-ified str, without special chars.

        See var f for only allowable chars to return.
        """

        # *Replace* unicode special chars with closest related char, decode to
        # string from unicode.
        if isinstance(s, unicode):
            s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore')
        s = s.lower()
        f = 'abcdefghijklmnopqrstuvwxyz0123456789'
        return str(filter(lambda x: x in f, s))

    @classmethod
    def strip_token(self, raw_token):
        # Must match the behavior of `stripToken()` in the neptune portal.
        # Currently in app_participate/name_or_id/name_or_id.component.js

        # function stripToken(rawToken) {
        #   return typeof rawToken !== 'string'
        #     ? undefined
        #     : rawToken.toLowerCase().replace(/[^a-z0-9]/g, '');
        # }

        if not isinstance(raw_token, basestring):
            return None
        return re.sub(r'[^a-z0-9]', '', unicode(raw_token).lower())

    @classmethod
    def get_for_team(klass, team_id, student_ids=None):
        if not student_ids:
            return klass.get(team_id=team_id)

        stripped_ids = [klass.strip_token(id) for id in student_ids]

        query = '''
            SELECT *
            FROM   `{table}`
            WHERE  `team_id` = %s
            AND `stripped_student_id` IN({interps})
        '''.format(
            table=klass.table,
            interps=','.join(['%s'] * len(stripped_ids)),
        )
        params = tuple([team_id] + stripped_ids)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)
        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def get_for_classroom(klass, team_id, classroom_id, student_ids=None):
        if student_ids is None:
            student_ids = []

        stripped_ids = [klass.strip_token(id) for id in student_ids]

        student_id_clause = 'AND `stripped_student_id` IN({})'.format(
            ','.join(['%s'] * len(stripped_ids))
        )
        query = '''
            SELECT *
            FROM   `{table}`
            WHERE
              # While the query would run without the team id (b/c classroom
              # would constrain it), including it is useful because when a
              # student id is included, the engine can then use the table's
              # team-student_id index. Try this query with EXPLAIN to see more.
              `team_id` = %s AND
              `classroom_ids` LIKE BINARY %s
              {student_id_clause}
        '''.format(
            table=klass.table,
            student_id_clause=student_id_clause if stripped_ids else '',
        )
        params = [team_id, '%{}%'.format(classroom_id)]

        if stripped_ids:
            params.append(stripped_ids)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, tuple(params))
        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def count_for_classroom(klass, classroom_id):
        query = '''
            SELECT COUNT(`uid`)
            FROM   `{table}`
            WHERE  `classroom_ids` LIKE BINARY %s
        '''.format(table=klass.table)
        params = ['%{}%'.format(classroom_id)]

        with mysql_connection.connect() as sql:
            num_students = sql.select_single_value(query, tuple(params))

        return num_students
