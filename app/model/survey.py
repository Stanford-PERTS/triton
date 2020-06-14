"""
Survey
===========

Survey, one-to-one with its team, with all classroom's students participating,
comprised of metrics a.k.a. growth conditions.
"""
import datetime
import logging

from model import SqlModel, SqlField as Field, Email
from .classroom import Classroom
from .cycle import Cycle
from .metric import Metric
from .program import Program
from .team import Team
import config
import mysql_connection


def date_to_dt(date):
    return datetime.datetime.combine(date, datetime.datetime.min.time())


class Survey(SqlModel):
    table = 'survey'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('team_id',       'varchar', 50,     None,     False, None,    None),
            # Also stored on Team.
            # Optional message to display above portal name field, e.g. "Please
            # enter your student ID."
            Field('portal_message','varchar', 2000,   None,     True,  SqlModel.sql_null, None),
            # Enough for over a hundred different relationships.
            # @todo(chris): enforce some limit in the Survey class.
            Field('metrics',       'varchar', 3500,   None,     False, '[]',    None),
            Field('open_responses','varchar', 3500,   None,     False, '[]',    None),
            Field('meta',          'text',    None,   None,     False, None,    None),
            Field('interval',      'int',     1,      True,     False, 2,       None),
            Field('notified',      'datetime',None,   None,     True, SqlModel.sql_null, None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'unique': True,
                'name': 'team',
                'fields': ['team_id'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    json_props = ['metrics', 'open_responses', 'meta']

    @classmethod
    def create(klass, **kwargs):
        """Surveys have all metrics active by default.

        This is so teams find it easy to run their initial "scan" survey.
        """
        if 'metrics' not in kwargs:
            # Default: all available metrics are active.
            kwargs['metrics'] = [m.uid for m in Metric.get()]

        if 'open_responses' not in kwargs:
            # Default: all active metrics have open_responses active.
            kwargs['open_responses'] = kwargs['metrics']

        if 'meta' not in kwargs:
            kwargs['meta'] = {}

        return super(klass, klass).create(**kwargs)

    @classmethod
    def create_for_team(klass, team):
        program = Program.get_by_id(team.program_id)

        if not program:
            raise Exception("Survey.create_for_team program not found: {}"
                            .format(team.program_id))

        program_metric_ids =[
            m['uid'] for m in program.metrics if m['default_active']
        ]

        return klass.create(
            team_id=team.uid,
            metrics=program_metric_ids,
            open_responses=program_metric_ids,
        )

    def after_put(self, init_kwargs, *args, **kwargs):
        is_using = self.meta.get('artifact_use', None) == 'true'
        url = self.meta.get('artifact_url', None)
        is_different = init_kwargs['meta'].get('artifact_url', None) != url
        if is_using and url and is_different:
            team = Team.get_by_id(self.team_id)
            team_url = 'https://copilot.perts.net/teams/{}'.format(
                team.short_uid)
            Email.create(
                to_address=config.from_server_email_address,
                subject=(
                    u"Message IT artifact URL needs review: {}"
                    .format(team.name)
                ),
                html=u'''
                    <p>Team name: <a href="{team_url}">{team_name}</a></p>
                    <p>
                        Artifact URL:
                        <a href="{artifact_url}">{artifact_url}</a>
                    </p>
                '''.format(
                    team_name=team.name,
                    artifact_url=self.meta['artifact_url'],
                    team_url=team_url,
                ),
            ).put()

    def get_metrics(self):
        if len(self.metrics) == 0:
            return []

        query = '''
            SELECT *
            FROM {table}
            WHERE `uid` IN ({interps})
        '''.format(
            table=Metric.table,
            interps=','.join(['%s'] * len(self.metrics))
        )
        params = tuple(self.metrics)  # list of uids
        with mysql_connection.connect() as sql:
            results = sql.select_query(query, params)

        return [Metric.row_dict_to_obj(d) for d in results]

    def get_classrooms(self):
        return Classroom.get(team_id=self.team_id)

    @classmethod
    def config_enabled(self, survey_id):
        query = '''
            SELECT p.`survey_config_enabled` as survey_config_enabled
            FROM `survey` s
            JOIN `team` t
              ON s.`team_id` = t.`uid`
            JOIN `program` p
              ON t.`program_id` = p.`uid`
            WHERE s.`uid` = %s
        '''
        params = (survey_id,)

        with mysql_connection.connect() as sql:
            results = sql.select_query(query, params)

        if len(results) == 0:
            # No program for this survey/team, default to enabled.
            return True
        return results[0]['survey_config_enabled'] == 1

    def should_notify(self, today):
        """Should cron running this week actually send notifications?"""
        cycle = Cycle.get_current_for_team(self.team_id, today)

        if not cycle:
            # The team hasn't scheduled a cycle for this week.
            return False

        if not self.notified or self.notified < date_to_dt(cycle.start_date):
            # Either we've never notified this team, or we've notified them in
            # past cycles. They're due for a notification.
            self.notified = date_to_dt(today)
            self.put()
            return cycle

        # Else the team has been notified during the current cycle; don't
        # notify them again.
        return False

    def to_client_dict(self):
        """Add codes; add metric labels for survey params in Qualtrics."""
        client_dict = super(Survey, self).to_client_dict()

        if len(self.metrics) == 0:
            metric_labels = {}
        else:
            metric_labels = {m.uid: m.label for m in self.get_metrics()}
        client_dict['metric_labels'] = metric_labels

        client_dict['codes'] = [c.code for c in self.get_classrooms()]

        return client_dict
