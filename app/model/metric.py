"""
Metric
===========

Metric, a.k.a. "growth condition" of student academic development, some metric
or set of metrics that may be included in the content of a survey.
"""
import logging

from model import SqlModel, SqlField as Field


class Metric(SqlModel):
    table = 'metric'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('name',          'varchar', 200,    None,     False, None,    None),
            # Computer-friendly version of the name, to ultimately be used as
            # embedded data names in Qualtrics, convention is lower-dash-case.
            Field('label',         'varchar', 50,     None,     False, None,    None),
            Field('description',   'text',    None,   None,     True,  SqlModel.sql_null,    None),
            # JSON field with structure:
            # [
            #   {
            #     "type": "reading",
            #     "text": "Research Background",
            #     "url": "http://www.psychresearch.org/coolpaper"}
            #   },
            #   ...
            # ]
            # Current UI plan is that there will be no metric details page. A
            # listed metric will just have an anchor to it's first link in this
            # structure. Not bothering to change the db in case the spec shifts
            # again later.
            Field('links',         'varchar', 2000,   None,     False, r'[]',   None),
        ],
        'primary_key': ['uid'],
        'indices': [],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['links']
