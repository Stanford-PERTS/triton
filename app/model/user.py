"""
User
===========

Represents Triton users.
"""
from google.appengine.api import memcache
import logging

from model import (
    Classroom,
    Network,
    Organization,
    SqlField as Field,
    SqlModel,
    Team,
)
import mysql_connection
import util


class DuplicateUser(Exception):
    """A user with the provided email already exists."""
    pass


class BadPassword(Exception):
    """Password doesn't match required pattern."""
    pass


class User(SqlModel):
    """Triton users.

    To search among related ids, like `owned teams`, this is of interest:

    SELECT * FROM `user` WHERE `owned_teams` LIKE BINARY '%Team_abcXYZ%'

    https://stackoverflow.com/questions/2602252/mysql-query-string-contains
    """
    table = 'user'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            # 200 is good enough for Queen Elizabeth II:
            # Elizabeth the Second, by the Grace of God, of the United Kingdom
            # of Great Britain and Northern Ireland and of Her other Realms and
            # Territories Queen, Head of the Commonwealth, Defender of the
            # Faith.
            Field('name',          'varchar', 200,    None,     True,  SqlModel.sql_null, None),
            Field('email',         'varchar', 200,    None,     False, None,    None),
            Field('phone_number',  'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            # Options are 'super_admin' and 'user'
            Field('user_type',     'varchar', 50,     None,     False, 'user',  None),
            # Not a text field because those aren't searchable, and we want to
            # be able to find users who own a given team.
            # Enough for over a hundred different relationships.
            # @todo(chris): enforce some limit in the User class.
            Field('owned_teams',   'varchar', 3500,   None,     False, '[]',    None),
            Field('owned_organizations','varchar',3500,None,    False, '[]',    None),
            Field('owned_networks','varchar', 3500,   None,     False, '[]',    None),
            Field('receive_email', 'bool',    None,   None,     False, 1,       None),
            Field('receive_sms',   'bool',    None,   None,     False, 1,       None),
            # This is an int instead of a boolean because it needs to be
            # nullable.
            Field('consent',       'tinyint', 1,      True,     True,  SqlModel.sql_null, None),
            Field('recent_program_id', 'varchar', 50, None,     True,  SqlModel.sql_null, None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'unique': True,
                'name': 'email',
                'fields': ['email'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['owned_teams', 'owned_organizations', 'owned_networks']

    @classmethod
    def create(klass, **kwargs):
        # Check lengths
        for fieldName in ('owned_teams',):
            field = next(f for f in klass.py_table_definition['fields']
                         if f.name == fieldName)
            val = kwargs.get(field.name, [])
            if len(val) > field.length:
                raise Exception(
                    "Value for {} too long (max {}): {}"
                    .format(field.name, field.length, val)
                )

        return super(klass, klass).create(**kwargs)

    @classmethod
    def create_public(klass):
        return super(klass, klass).create(
            id='public',
            name='public',
            email='public',
            user_type='public',
        )

    @classmethod
    def query_by_name_or_email(klass, search_str):
        # N.B. **Not** using LIKE BINARY allows case-insensitive search.
        query = '''
            SELECT *
            FROM `{table}`
            WHERE
                `name` LIKE %s OR
                `email` LIKE %s
            ORDER BY `email`
        '''.format(table=klass.table)

        search_wildcard = '%{}%'.format(search_str)
        params = (search_wildcard, search_wildcard)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_team(klass, team_id_or_ids):
        """Warning: using many team ids is very inefficient. See
        https://www.brentozar.com/archive/2010/06/sargable-why-string-is-slow/
        """
        if type(team_id_or_ids) in (tuple, list):
            team_ids = team_id_or_ids
        else:
            team_ids = [team_id_or_ids]


        like_clause = ' OR '.join(
            '`owned_teams` LIKE BINARY %s' for id in team_ids
        )
        query = '''
            SELECT *
            FROM `{table}`
            WHERE {like_clause}
        '''.format(table=klass.table, like_clause=like_clause)
        params = tuple('%{}%'.format(id) for id in team_ids)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_organization(klass, org_id):
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `owned_organizations` LIKE BINARY %s
        '''.format(table=klass.table)
        params = ('%{}%'.format(org_id),)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def query_by_network(klass, network_id):
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `owned_networks` LIKE BINARY %s
        '''.format(table=klass.table)
        params = ('%{}%'.format(network_id),)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def resolve_id_mismatch(klass, user, new_id):
        """Change all references to user's id to a new id.

        N.B. this is obviously brittle; when the relationship schema changes,
        this will also have to change.
        """
        # The auth server has a different id for this user; defer to it.

        teams = Team.get(captain_id=user.uid)
        for t in teams:
            t.captain_id = new_id
        Team.put_multi(teams)

        classrooms = Classroom.get(contact_id=user.uid)
        for c in classrooms:
            c.contact_id = new_id
        Classroom.put_multi(classrooms)

        params = {'uid': new_id, 'short_uid': SqlModel.convert_uid(new_id)}
        with mysql_connection.connect() as sql:
            sql.update_row(klass.table, 'uid', user.uid, **params)

        for k, v in params.items():
            setattr(user, k, v)

        return user

    @classmethod
    def get_by_auth(klass, auth_type, auth_id):
        """Exists for parity with Neptune user methods."""
        if auth_type != 'email':
            raise Exception("Triton only accepts auth_type 'email', given {}."
                            .format(auth_type))

        email = auth_id.lower()

        matches = User.get(email=auth_id.lower(), order='created')

        if len(matches) == 0:
            return None
        elif len(matches) == 1:
            return matches[0]
        elif len(matches) > 1:
            logging.error(u"More than one user matches auth info: {}, {}."
                          .format(auth_type, auth_id))

            # We'll let the function pass on and take the first of multiple
            # duplicate users, which will be the earliest-created one.
            return matches[0]

    @classmethod
    def email_exists(self, email):
        """Exists for parity with Neptune user methods."""
        return len(User.get(email=email.lower())) > 0

    @classmethod
    def get_main_contacts(klass, classrooms):
        if len(classrooms) == 0:
            return []

        query = '''
            SELECT *
            FROM `{table}`
            WHERE `uid` IN ({interps})
        '''.format(
            table=klass.table,
            interps=','.join(['%s'] * len(classrooms))
        )
        params = tuple(c.contact_id for c in classrooms)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @property
    def super_admin(self):
        return self.user_type == 'super_admin'

    @property
    def first_name(self):
        if self.name and ' ' in self.name:
            return self.name.split(' ')[0]
        else:
            return self.name

    def get_owner_property(self, id_or_entity):
        owner_props = {
            'Team': 'owned_teams',
            'Organization': 'owned_organizations',
        }
        kind = SqlModel.get_kind(id_or_entity)
        return getattr(self, owner_props[kind])if kind in owner_props else None

    def get_networked_organization_ids(self):
        networked_org_ids = set()
        for network in Network.get_by_id(self.owned_networks):
            networked_org_ids.update(network.associated_organization_ids())

        if len(networked_org_ids) >= 100:
            logging.error(
                "100 or more orgs associated to user via network: {}"
                .format(self.uid)
            )

        return networked_org_ids

    def after_put(self, init_kwargs, *args, **kwargs):
        """Reset memcache for related objects

        * Include _all_ those the user is joining (e.g. on creation) as well as
          any the user is leaving.
        * Include name changes stored elsewhere
        """
        rels = ((Team, 'owned_teams'), (Organization, 'owned_organizations'))
        for model, attr in rels:
            original_ids = set(init_kwargs[attr])
            new_ids = set(getattr(self, attr))
            leaving_ids = original_ids.difference(new_ids)

            for uid in set(new_ids).union(leaving_ids):
                model.update_cached_properties(uid)

        # If this user is the contact for any classrooms, and their name has
        # changed, update the name of the classroom.
        if init_kwargs['name'] != self.name:
            for c in Classroom.get(contact_id=self.uid):
                key = util.cached_properties_key(c.uid)
                cached_props = memcache.get(key) or {}
                memcache.set(key, dict(cached_props, contact_name=self.name))

    def to_client_dict(self, is_self=True):
        d = super(User, self).to_client_dict()

        # Compile network-to-org associations to avoid duplicating logic on the
        # client.
        d['networked_organizations'] = list(
            self.get_networked_organization_ids())

        # When not your own user, strip sensitive properties.
        safe_properties = (
            'uid',
            'short_uid',
            'email',
            'name',
            'networked_organizations',
            'owned_organizations',
            'owned_teams',
            'phone_number',
        )

        if not is_self:
            for k in d.keys():
                if k not in safe_properties:
                    del d[k]

        return d
