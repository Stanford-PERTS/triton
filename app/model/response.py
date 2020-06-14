"""
Response
===========

Responses of users running a single survey together with their students.

Note: schema must be kept in sync with the ResponseBackup.
"""
from google.appengine.api import taskqueue
import copy
import datetime
import json
import logging
import MySQLdb

from model import (SqlModel, SqlField as Field, JsonTextValueLengthError,
                   JsonTextDictLengthError, JsonTextLengthError,
                   JSON_TEXT_VALUE_MAX, JSON_TEXT_DICT_MAX,
                   JSON_TEXT_MAX)
import mysql_connection
import util


class ResponseBodyKeyConflict(Exception):
    """Tried to update a response body with an old timestamp."""
    pass


class ResponseIndexConflict(Exception):
    pass


class ResponseNotFound(Exception):
    pass


class Response(SqlModel):
    table = 'response'

    USER_LEVEL_SYMBOL = 'User'
    TEAM_LEVEL_SYMBOL = 'Team'
    CYCLE_LEVEL_SYMBOL = 'Cycle'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            # Can be 'User', 'Team', or 'Cycle'
            Field('type',          'varchar', 20,     None,     False, None,    None),
            # The default here is to keep responses private, just for safety,
            # b/c in practice the default is set in Response.create().
            Field('private',       'bool',    None,   None,     False, 1,       None),
            # Empty string if this is a 'Team' or 'Cycle' type
            Field('user_id',       'varchar', 50,     None,     False, None,    None),
            Field('team_id',       'varchar', 50,     None,     False, None,    None),
            # Most often a cycle id.
            Field('parent_id',     'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            # Name of the module within the cycle that recorded this
            # response.
            Field('module_label',  'varchar', 50,     None,     False, None,    None),
            # Tinyint unsigned allows 0 to 255. Normal operation stores progress
            # values within 0 to 100.
            Field('progress',      'tinyint', 4,      True,     False, 0,       None),
            Field('page',          'tinyint', 4,      True,     True,  SqlModel.sql_null, None),
            Field('body',          'text',    None,   None,     True,  None,    None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'name': 'parent',
                'fields': ['parent_id'],
            },
            {
                'name': 'user',
                'fields': ['user_id'],
            },
            {
                'name': 'type-user-team-parent-module',
                'unique': True,
                'fields': [
                    'type',
                    'user_id',
                    'team_id',
                    'parent_id',
                    'module_label'
                ],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['body']

    @classmethod
    def create(klass, **kwargs):
        is_user_id = klass.get_kind(kwargs['user_id']) == 'User'

        kwargs['type'] = kwargs.get('type', 'User')
        is_team_level = kwargs['type'] == klass.TEAM_LEVEL_SYMBOL
        is_cycle_level = kwargs['type'] == klass.CYCLE_LEVEL_SYMBOL
        is_user_level = kwargs['type'] == klass.USER_LEVEL_SYMBOL

        if (not is_user_id and not (is_team_level or is_cycle_level)):
            raise Exception(
                "Invalid `user_id` for response: {}"
                .format(kwargs['user_id'])
            )

        if 'private' not in kwargs:
            # By default, user-level responses are private, others are not.
            kwargs['private'] = is_user_level

        return super(klass, klass).create(**kwargs)

    @classmethod
    def insert_or_conflict(klass, params):
        """Put a new entity to the db, or raise if it exists.

        Returns the inserted response.

        Raises ResponseIndexConflict, JsonTextValueLengthError, or
        JsonTextDictLengthError.
        """
        # The tactic is to skip the normal insert-or-update check and do a
        # blind insert, then catch any duplicate index errors.

        # Make sure to pick up any defaults and make any checks in the create
        # method, since this is a new entity.
        response = klass.create(**params)

        # Note this does NOT use the typical .put() interface, so we have to be
        # careful to re-create all the normal features, like the before_put and
        # after_put hooks.
        # In this case, before_put has sanity checks.
        response.before_put(response._init_kwargs)

        row_to_insert = klass.coerce_row_dict(response.to_dict())  # py -> sql
        try:
            with mysql_connection.connect() as sql:
                sql.insert_row_dicts(klass.table, [row_to_insert])
                row = sql.select_star_where(klass.table, uid=response.uid)[0]
        except MySQLdb.IntegrityError as e:
            # Expected when there's already a respond matching these params in
            # the type-user-team-parent-module index.
            raise ResponseIndexConflict()

        inserted_response = klass.row_dict_to_obj(row)  # sql -> py

        # Responses are backed up to other tables with this hook.
        inserted_response.after_put(response._init_kwargs)

        return inserted_response

    @classmethod
    def update_or_conflict(klass, response_id, params, force):
        """Update an existing response in the db, and raise if any updated
        fields are out of date.

        Args:
            response_id: str, uid of the response to update
            params: dict, new data to save to the response
            force: bool, whether the user acknowledged a conflict on this
                update previously and has chosen to write to it anyway.
                See Response.mix_body()

        Returns the updated response.

        Raises ResponseNotFound, ResponseBodyKeyConflict,
        JsonTextValueLengthError, or JsonTextDictLengthError.

        MySQLdb uses transactions by default, and waits for you to commit or
        or roll back. That means to transactionalize this operation, we just
        need to

        1. Use a SELECT... FOR UPDATE query, which locks the row.
        2. Pack all of the transactions' queries into the same with: block.

        http://mysql-python.sourceforge.net/MySQLdb.html
        https://riptutorial.com/mysql/example/24166/row-level-locking
        """
        # Avoid retries, which close and re-open the connection, which might
        # interrupt our transaction.
        with mysql_connection.connect(retry_on_error=False) as sql:
            # Locks the row until commit (when this block exits).
            rows = sql.select_row_for_update(klass.table, 'uid', response_id)

            if not rows:
                raise ResponseNotFound()

            row = klass.coerce_row_dict(rows[0])  # sql -> python

            # Update any new values in the body. Assume any other parameters
            # have been approved by the api handler.
            params['body'] = Response.mix_body(
                row['body'], params['body'], force)

            # Run the checks in before_put(). Don't just do entity.put()
            # since that would commit the transaction. Instead mock just enough
            # of an entity to run the sanity checks.
            temp_entity = klass(**params)
            temp_entity.before_put(temp_entity._init_kwargs)

            new_row = klass.coerce_row_dict(params)  # python -> sql

            sql.update_row(klass.table, 'uid', response_id, **new_row)

            # w/ updated modified time
            row = sql.select_star_where(klass.table, uid=response_id)[0]

        updated_response = klass.row_dict_to_obj(row)  # sql -> py

        # Responses are backed up to other tables with this hook.
        updated_response.after_put(temp_entity._init_kwargs)

        return updated_response

    @classmethod
    def get_for_teams_unsafe(klass, team_ids, parent_id=None):
        """Does NOT strip the body property of any responses."""
        if parent_id:
            where = 'AND `parent_id` = %s'
            params = tuple(team_ids) + (parent_id,)
        else:
            where = ''
            params = tuple(team_ids)
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `team_id` IN({interps})
            {where}
        '''.format(
            table=klass.table,
            interps=', '.join(['%s'] * len(team_ids)),
            where=where,
        )

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        unsafe_responses = [klass.row_dict_to_obj(d) for d in row_dicts]
        return unsafe_responses

    @classmethod
    def get_for_teams(klass, user, team_ids, parent_id=None):
        unsafe = klass.get_for_teams_unsafe(team_ids, parent_id)
        return klass.redact_private_responses(unsafe, user)

    @classmethod
    def redact_private_responses(klass, unsafe_responses, user):
        """Clears body for private responses except own user-level."""
        if user.super_admin:
            return unsafe_responses

        responses = []
        for r in unsafe_responses:
            if r.private:
                if r.type == klass.USER_LEVEL_SYMBOL and r.user_id == user.uid:
                    # Although this is private, the given user owns it; let
                    # them see the data in the body.
                    pass
                else:
                    # This response is private and it doesn't belong to the
                    # given user. Redact.
                    r.body = {}
            else:
                # This response is not private. Don't redact.
                pass

            responses.append(r)

        return responses

    @classmethod
    def mix_body(self, old_body, new_body, force=False):
        """Updates a response body intelligently, mixing new and modified keys
        with existing ones.

        Returns dict of the new body mixed into the old.

        Raises ResponseBodyKeyConflict
        """
        current_timestamp = datetime.datetime.now()

        body = copy.deepcopy(old_body)
        conflicted_keys = []
        for k, info in new_body.items():
            # Incoming data to mix with the old body.
            value = info.get('value', None)
            mod = info.get('modified', None)

            if force:
                # Client has seen the warning and wants to override data.
                should_write = True
            elif k not in body:
                # New key, just add it.
                should_write = True
            elif k in body and value == body[k]['value']:
                # Unchanged key, don't update timestamp.
                should_write = False
            elif k in body and mod == body[k]['modified']:
                # New value for this key, client has fresh data.
                should_write = True
            elif k in body and mod < body[k]['modified']:
                # Client has stale data. Will raise after loop is done.
                should_write = False
                conflicted_keys.append(k)
            elif k in body and mod > body[k]['modified']:
                raise Exception(
                    "Got modified time newer than db: {}: {}".format(k, mod))
            else:
                raise Exception("Unknown conflict case.")

            if should_write:
                body[k] = {
                    'value': value,
                    'modified': current_timestamp,
                }

        if len(conflicted_keys) > 0:
            # Don't commit any of the incoming changes. Tell the client which
            # keys have conflicts.
            raise ResponseBodyKeyConflict(conflicted_keys)

        return body

    def before_put(self, init_kwargs):
        if self.body is None:
            return

        if not isinstance(self.body, dict):
            raise Exception(
                u"Expected dictionary for response body, got {}: {}"
                .format(type(self.body), self.body)
            )

        if len(self.body) >= JSON_TEXT_DICT_MAX:
            raise JsonTextDictLengthError()

        for k, v in self.body.items():
            value_text = json.dumps(v, default=util.json_dumps_default)
            if len(value_text) >= JSON_TEXT_VALUE_MAX:
                raise JsonTextValueLengthError()

        body_text = json.dumps(self.body, default=util.json_dumps_default)
        if len(body_text) >= JSON_TEXT_MAX:
            raise JsonTextLengthError()

    def after_put(self, *args, **kwargs):
        """Save a copy of this response to the backup table.

        Taskqueue docs:
        https://cloud.google.com/appengine/docs/standard/python/refdocs/google.appengine.api.taskqueue#google.appengine.api.taskqueue.add
        """
        taskqueue.add(
            url='/task/backup_response',
            payload=json.dumps(self.to_dict(), default=util.json_dumps_default),
            headers={'Content-Type': 'application/json'},
            # default retry_options makes 5 attempts
        )
