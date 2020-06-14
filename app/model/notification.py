"""
Notification
===========

Structured text about a single user-focused event, e.g. "Report for you
classroom Geometry is ready", to be used to construct digests, emails, a/o SMS
messages.

Depends on html templates in /templates/notifications.
"""

import datetime
import jinja2
import logging
import mysql_connection
import os

from model import SqlModel, SqlField as Field
import config
import util


jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True,
)


class Notification(SqlModel):
    table = 'notification'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('user_id',       'varchar', 50,     None,     False, None,    None),
            # 'generic', 'survey', or 'report' as of 2017-07-26
            Field('type',          'varchar', 50,     None,     False, None,    None),
            Field('template_params','varchar',2000,   None,     False, r'{}',   None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'name': 'user-created',
                'fields': ['user_id', 'created'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['template_params']

    @classmethod
    def create(klass, **kwargs):
        # Check lengths
        for fieldName in ('template_params',):
            field = next(f for f in klass.py_table_definition['fields']
                         if f.name == fieldName)
            if len(kwargs[field.name]) > field.length:
                raise Exception(
                    "Value for {} too long (max {}): {}"
                    .format(field.name, field.length, kwargs[field.name])
                )

        return super(klass, klass).create(**kwargs)

    def get_template(self):
        template_path = 'notifications/digest_item_{}.html'.format(self.type)
        return jinja_env.get_template(template_path)

    def render(self):
        """Interpolate data into an html string.

        Ignores `{items}` b/c that's for digest().
        """
        # Add environment and user details to params.
        protocol = 'http' if util.is_localhost() else 'https'
        domain = ('localhost:3000' if util.is_localhost()
                  else os.environ['HOSTING_DOMAIN'])
        params = dict(
            self.template_params,
            triton_domain='{}://{}'.format(protocol, domain),
            user_id=self.user_id,
            short_user_id=Notification.convert_uid(self.user_id),
        )
        return self.get_template().render(**params)

    @classmethod
    def users_with_notifications(klass, start, end):
        """What users have notifications? Returns ids."""
        query = '''
            SELECT DISTINCT `user_id`
            FROM `{table}`
            WHERE `created` > %s
              AND `created` <= %s
        '''.format(table=Notification.table)
        # MySQLDb doesn't like our ISO format, change to SQL format.
        start = datetime.datetime.strptime(start, config.iso_datetime_format)
        end = datetime.datetime.strptime(end, config.iso_datetime_format)
        start = start.strftime('%Y-%m-%d %H:%M:%S')
        end = end.strftime('%Y-%m-%d %H:%M:%S')
        params = (start, end)
        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)
        return [d['user_id'] for d in row_dicts]

    @classmethod
    def get_period_for_user(klass, user, start, end):
        # SqlModel.get() doesn't support WHERE clauses that aren't = or IN(),
        # so we have to work around it.
        query = '''
            SELECT *
            FROM `{table}`
            WHERE `user_id` = %s
              AND `created` > %s
              AND `created` <= %s
        '''.format(table=klass.table)
        # MySQLDb doesn't like our ISO format, change to SQL format.
        start = datetime.datetime.strptime(start, config.iso_datetime_format)
        end = datetime.datetime.strptime(end, config.iso_datetime_format)
        start = start.strftime('%Y-%m-%d %H:%M:%S')
        end = end.strftime('%Y-%m-%d %H:%M:%S')
        params = (user.uid, start, end)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]
