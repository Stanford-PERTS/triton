"""
Program
===========

Settings that customize the behavior of teams and cycles, mostly the content
users are tasked with during cycles.
"""
import logging

from model import SqlModel, SqlField as Field
import mysql_connection


class Program(SqlModel):
    table = 'program'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('name',          'varchar', 200,    None,     False, None,    None),
            Field('label',         'varchar', 50,     None,     False, None,    None),
            # Lists metric uids.
            Field('metrics',       'varchar', 3500,   None,     False, '[]',    None),
            # Whether the route/view for survey configuration is available
            # for this team. Also restricts access to PUT /api/surveys/:id.
            Field('survey_config_enabled','bool', None,None,    False, 1,       None),
            Field('target_group_enabled','bool', None,None,     False, 1,       None),
            # See https://github.com/PERTS/triton/issues/1632
            # Set to False to enable cycleless mode. Teams won't create cycles,
            # but there will be single cycle that is invisible to the end user.
            # This cycle will still exist to set survey participation start/end
            # dates.
            Field('use_cycles',    'bool',    None,   None,     False, 1,       None),
            # See https://github.com/PERTS/triton/issues/1641
            # The specs in the linked LucidChart require the ability to hide
            # the classrooms UI. Set to False to hide classrooms.
            Field('use_classrooms','bool',    None,   None,     False, 1,       None),
            # If there are already this many cycles, shouldn't be allowed to
            # add more to the team. -1 means unlimited; translated in js to
            # Infinity.
            Field('max_cycles',    'tinyint', 3,      None,     False, -1,      None),
            # This many cycles will be automatically created when the team is
            # created, can't if there are only this many cycles can't be
            # deleted.
            Field('min_cycles',    'tinyint', 3,      True,     False,  3,      None),
            Field('min_cycle_weekdays', 'tinyint', 3, True,     False,  5,      None),
            Field('send_cycle_email', 'bool', None,   None,     False, 1,       None),
            # If there are already this many users, shouldn't be allowed to add
            # more to the team. -1 means unlimited; translated in js to
            # Infinity.
            Field('max_team_members', 'tinyint', 3,   None,     False,  -1,     None),
            Field('team_term',     'varchar', 50,     None,     False, 'Team',  None),
            Field('classroom_term','varchar', 50,     None,     False, 'Class', None),
            Field('captain_term',  'varchar', 50,     None,     False, 'Captain', None),
            Field('contact_term',  'varchar', 50,     None,     False, 'Main Contact', None),
            Field('member_term',   'varchar', 50,     None,     False, 'Teacher', None),
            Field('organization_term', 'varchar', 50, None,     False, 'Community', None),
            Field('preview_url',   'varchar', 1000,   None,     False, None,    None),
            # If this is false, teams can't be created with this program.
            Field('active',        'bool',    None,   None,     False, 1,       None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'unique': True,
                'name': 'label',
                'fields': ['label'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['metrics']

    @classmethod
    def create(klass, **kwargs):
        # Cycleless mode programs should only have a single cycle.
        if 'use_cycles' in kwargs:
            cycleless_mode = not kwargs['use_cycles']
            invalid_cycles = (kwargs['min_cycles'] != 1 or
                              kwargs['max_cycles'] != 1)

            if cycleless_mode and invalid_cycles:
                raise Exception(
                    "Programs set to cycleless mode can only have 1 cycle."
                )

        if 'label' in kwargs:
            kwargs['label'] = kwargs['label'].lower()

        return super(klass, klass).create(**kwargs)

    @classmethod
    def get_by_label(klass, label):
        programs = Program.get(label=label)
        return programs[0] if len(programs) > 0 else None
