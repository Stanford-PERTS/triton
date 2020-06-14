"""
Organization
===========

Collection of teams, where members of the org act as captain for those teams.
"""
from google.appengine.api import memcache
import logging
import string

from .program import Program
from model import SqlModel, SqlField as Field
import mysql_connection
import os_random
import util


class Organization(SqlModel):
    table = 'organization'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,              type,      length, unsigned, null,  default, on_update
            Field('uid',             'varchar', 50,     None,     False, None,    None),
            Field('short_uid',       'varchar', 50,     None,     False, None,    None),
            Field('created',         'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',        'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('name',            'varchar', 200,    None,     True,  SqlModel.sql_null, None),
            Field('code',            'varchar', 50,     None,     False, None,    None),
            Field('phone_number',    'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            Field('mailing_address', 'varchar', 500,    None,     True,  SqlModel.sql_null, None),
            # Teams created with this org get this program association.
            Field('program_id',      'varchar', 50,     None,     False,  None, None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'name': 'name',
                'fields': ['name'],
            },
            {
                'unique': True,
                'name': 'code',
                'fields': ['code'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    default_cached_properties = {
        'num_teams': 0,
        'num_users': 0,
    }

    @classmethod
    def create(klass, **kwargs):
        if 'code' not in kwargs:
            kwargs['code'] = klass.generate_unique_code()
        # else the code is specified, and if it's a duplicate, MySQL will raise
        # an exception b/c there's a unique index on that field.
        return super(klass, klass).create(**kwargs)

    @classmethod
    def generate_unique_code(klass):
        chars = string.ascii_uppercase + string.digits
        for x in range(5):
            code = ''.join(os_random.choice(chars) for x in range(6))
            matches = klass.get(code=code)
            if len(matches) == 0:
                break
        if len(matches) > 0:
            raise Exception("After five tries, could not generate a unique"
                            "organization invitation code.")
        return code

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
        if len(user.owned_organizations) == 0:
            return []

        query = '''
            SELECT *
            FROM `{table}`
            WHERE `uid` IN ({ids}) {program_clause}
            ORDER BY `name`
        '''.format(
            table=klass.table,
            ids=','.join('%s' for uid in user.owned_organizations),
            program_clause='AND `program_id` = %s' if program_id else ''
        )
        params = tuple(user.owned_organizations +
                       ([program_id] if program_id else []))

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_team(klass, team_id):
        query = '''
            SELECT o.*
            FROM `organization` o
            JOIN `team` t
              ON t.`organization_ids` LIKE BINARY CONCAT('%%', o.`uid`, '%%')
            WHERE t.`uid` = %s
            ORDER BY o.`name`
        '''
        params = (team_id,)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def get_cached_properties_from_db(self, org_id):
        """Count how many related users and teams there are."""
        query = '''
            SELECT COUNT(DISTINCT(t.`uid`)) as num_teams
            ,      COUNT(DISTINCT(u.`uid`)) as num_users
            FROM `organization` o
            LEFT OUTER JOIN `user` u
              ON  u.`owned_organizations` LIKE BINARY %s
            LEFT OUTER JOIN `team` t
              ON  t.`organization_ids` LIKE BINARY %s
            WHERE o.`uid` = %s
        '''
        params = (
            '%{}%'.format(org_id),
            '%{}%'.format(org_id),
            org_id,
        )

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        if len(row_dicts) == 0:
            return {}
        elif len(row_dicts) == 1:
            # {'num_users': int, 'num_teams': int}
            return {k: int(v) for k, v in row_dicts[0].items()}
        else:
            raise Exception(
                "Multiple results for organization cached properties.")

    @classmethod
    def update_cached_properties(klass, org_id):
        """If we find the org in the db, query for rel counts and cache."""
        from_db = Organization.get_cached_properties_from_db(org_id)
        if from_db:
            memcache.set(util.cached_properties_key(org_id), from_db)
        return from_db

    def to_client_dict(self):
        """Decorate the org with counts of related objects; cached."""
        d = super(Organization, self).to_client_dict()

        # Decorate the team with counts of related objects; cached.
        d.update(self.default_cached_properties)
        cached = memcache.get(util.cached_properties_key(self.uid))
        if cached:
            d.update(cached)
        else:
            d.update(Organization.update_cached_properties(self.uid))

        return d
