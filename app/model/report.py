"""
Report
===========

Report, one-to-one with its team, with all classroom's students participating,
comprised of growth conditions.
"""
import datetime
import logging

from model import SqlModel, SqlField as Field
import config
import mysql_connection


class Report(SqlModel):
    """Similar to StorageObject, but SQL-backed."""
    table = 'report'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('parent_id',     'varchar', 50,     None,     False, None,    None),
            Field('network_id',    'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            Field('organization_id','varchar',50,     None,     True,  SqlModel.sql_null, None),
            Field('team_id',       'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            Field('classroom_id',  'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            # Dataset hosted on Neptune, e.g. available at
            # neptune.perts.net/api/datasets/:dataset_id
            Field('dataset_id',    'varchar', 50,     None,     True,  SqlModel.sql_null, None),
            # Html template on Neptune with which this report should be viewed,
            # e.g. neptune.perts.net/datasets/:dataset_id/:template/:filename
            Field('template',      'varchar', 200,    None,     True,  SqlModel.sql_null, None),
            # Name as uploaded, set in header when downloaded.
            Field('filename',      'varchar', 200,    None,     False, None,    None),
            # Path to file on Google Cloud Storage:
            # r'^/(?P<bucket>.+)/data_tables/(?P<object>.+)$'
            # Stored file names are md5 hashes, e.g.
            # '04605dbc5fd9d50836712b436dbb5dbd'
            Field('issue_date',    'date',    None,   None,     True,  SqlModel.sql_null, None),
            Field('gcs_path',      'varchar', 200,    None,     True,  SqlModel.sql_null, None),
            # Size of the file, in bytes, can be up to 4,294,967,295 ie 4.3 GB
            Field('size',          'int',       4,    True,     True,  SqlModel.sql_null, None),
            # Content type (example: 'text/csv')
            Field('content_type',  'varchar', 200,    None,     True,  SqlModel.sql_null, None),
            # Reports with preview true can only be seen by super admins, and
            # are automatically switched to preview false under certain
            # conditions, see cron_handlers.
            Field('preview',       'bool',    None,   None,     False, 1,       None),
            Field('notes',         'text',    None,   None,     True,  None,    None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'unique': True,
                'name': 'parent-file',
                'fields': ['parent_id', 'filename'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    def to_client_dict(self):
        d = super(Report, self).to_client_dict()

        parts = self.filename.split('.')
        d['week'] = parts[0] if len(parts) > 1 else None

        return d

    @classmethod
    def create(klass, **kwargs):
        # The parent should be the _smallest_ scope available, because
        # typically a given reporting unit (e.g. classroom) will have a
        # large scope (e.g. team) displayed in it as well for context.
        if kwargs.get('classroom_id', None):
            kwargs['parent_id'] = kwargs['classroom_id']
        elif kwargs.get('team_id', None):
            kwargs['parent_id'] = kwargs['team_id']
        elif kwargs.get('organization_id', None):
            kwargs['parent_id'] = kwargs['organization_id']
        elif kwargs.get('network_id', None):
            kwargs['parent_id'] = kwargs['network_id']

        if not kwargs.get('parent_id', None):
            raise Exception(u"Could not create report w/o parent; kwargs: {}"
                            .format(kwargs))

        return super(klass, klass).create(**kwargs)

    @classmethod
    def get_previews(klass, week):
        return klass.get(
            filename='{}.html'.format(week),
            preview=True,
            n=float('inf'),
        )

    @classmethod
    def release_previews(klass, week):
        """Set preview to False for all reports in a given week.

        Args:
            week - str, YYYY-MM-DD
        """
        # Parse the week to make sure it's valid.
        datetime.datetime.strptime(week, config.iso_date_format)

        query = '''
            UPDATE {table}
            SET `preview` = 0
            WHERE `filename` = %s
        '''.format(table=klass.table)
        params = ('{}.html'.format(week),)

        with mysql_connection.connect() as sql:
            sql.query(query, params)
            affected_rows = sql.connection.affected_rows()

        return int(affected_rows)


    @classmethod
    def get_for_team(klass, team_id, include_preview, n=1000):
        preview_clause = '' if include_preview else '`preview` = 0 AND'
        query = '''
            SELECT *
            FROM `{table}`
            WHERE
                `team_id` = %s AND
                {preview_clause}
                # GCS-based reports have a NULL template; these should not
                # be excluded, but "empty" reports should be.
                (`template` != 'empty' OR `template` IS NULL)
            ORDER BY `issue_date`, `filename`
            LIMIT %s
        '''.format(table=klass.table, preview_clause=preview_clause)
        params = (team_id, n)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def get_for_network(klass, network_id, include_preview, n=1000):
        preview_clause = '' if include_preview else '`preview` = 0 AND'
        query = '''
            SELECT *
            FROM `{table}`
            WHERE
                `parent_id` = %s AND
                {preview_clause}
                # GCS-based reports have a NULL template; these should not
                # be excluded, but "empty" reports should be.
                (`template` != 'empty' OR `template` IS NULL)
            ORDER BY `issue_date`, `filename`
            LIMIT %s
        '''.format(table=klass.table, preview_clause=preview_clause)
        params = (network_id, n)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    @classmethod
    def get_for_organization(klass, org_id, include_preview, n=1000):
        preview_clause = '' if include_preview else '`preview` = 0 AND'
        query = '''
            SELECT *
            FROM `{table}`
            WHERE
                `parent_id` = %s AND
                {preview_clause}
                # GCS-based reports have a NULL template; these should not
                # be excluded, but "empty" reports should be.
                (`template` != 'empty' OR `template` IS NULL)
            ORDER BY `issue_date`, `filename`
            LIMIT %s
        '''.format(table=klass.table, preview_clause=preview_clause)
        params = (org_id, n)

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]
