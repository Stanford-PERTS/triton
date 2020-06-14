"""URL Handlers designed to be simple wrappers over our tasks."""

from datetime import date, datetime, timedelta
from google.appengine.api import namespace_manager
from google.appengine.api import taskqueue
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
import json
import logging
import os
import webapp2

from api_handlers import TeamsClassrooms
from gae_handlers import BaseHandler, Route
from model import (Digest, Classroom, Cycle, Program, Response, ResponseBackup,
                   Survey, Team, User)
import cycle_emailers
import jwt_helper
import mysql_connection
import config
import util


def participation_query_url(cycle, classrooms):
    if util.is_localhost():
        protocol = 'http'
        neptune_domain = 'localhost:8080'
    else:
        protocol = 'https'
        neptune_domain = os.environ['NEPTUNE_DOMAIN']

    url = '{protocol}://{domain}/api/project_cohorts/participation'.format(
        protocol=protocol,
        domain=neptune_domain,
    )
    return util.set_query_parameters(
        url,
        uid=[c.url_code for c in classrooms],
        start=cycle.start_date.strftime(config.iso_datetime_format),
        end=cycle.end_date.strftime(config.iso_datetime_format),
    )


def get_participation(cycle, classrooms):
    handler = TeamsClassrooms()
    user = User.create(id='triton', email='')

    payload = jwt_helper.get_payload(user)
    payload['allowed_endpoints'] = [
        BaseHandler().get_endpoint_str(
            'GET',
            'neptune',
            '/api/project_cohorts/{}/participation'.format(c.url_code)
        )
        for c in classrooms
    ]
    jwt = jwt_helper.encode(payload)

    result = urlfetch.fetch(
        url=participation_query_url(cycle, classrooms),
        method=urlfetch.GET,
        headers={'Authorization': 'Bearer {}'.format(jwt)}
    )

    if not result or result.status_code != 200:
        raise Exception("Failed to get participation {}".format(result))

    return json.loads(result.content)


class TaskWorker(webapp2.RequestHandler):
    """Abstract handler for a push queue task.

    The POST method is for the server to use after the code calls
    taskqueue.add(). If you POST, you'll run the same code, but you won't get
    any queueing benefits like the 10 minute run time or rate-limiting.

    If you're a human and you want to manually queue a task, use the following
    GET method.
    """
    def dispatch(self):
        # Set the namespace, which varies by branch.
        namespace = os.environ['NAMESPACE']
        if namespace:
            logging.info("Setting namespace: {}".format(namespace))
            namespace_manager.set_namespace(namespace)

        # Call the overridden dispatch(), which has the effect of running
        # the get() or post() etc. of the inheriting class.
        webapp2.RequestHandler.dispatch(self)

    def get(self, *args, **kwargs):
        """Add a task to a queue."""
        task = taskqueue.add(url=self.request.path_qs,
                             queue_name=self.queue_name())
        self.response.write(json.dumps({
            'url': task.url,
            'was_deleted': task.was_deleted,
            'was_enqueued': task.was_enqueued,
        }))

    def queue_name(self):
        return self.request.get('queue_name', 'default')


class DigestUserNotifications(TaskWorker):
    def post(self, user_id):
        """Save digests for a users notifications over some period.

        The period defaults to the past 24 hours to make it easy to call
        manually (via a GET) if necessary. For normal timing, see cron.yaml.
        """
        # to_dt = lambda s: datetime.strptime(s, config.iso_datetime_format)
        user = User.get_by_id(user_id)
        now = datetime.now()
        start = self.request.get('start', now - timedelta(hours=24))
        end = self.request.get('end', now)

        digests, emails, smss = Digest.process_user(user, start, end)

        # Save digests so users can review them on their notifications page.
        Digest.put_multi(digests)
        # Queue messages to send.
        ndb.put_multi(emails)
        ndb.put_multi(smss)

        self.response.write(json.dumps({
            'digest_ids': [d.uid for d in digests],
            'email_ids': [e.uid for e in emails],
            'sms_ids': [s.uid for s in smss],
        }))


class TeamCycleEmails(TaskWorker):

    def post(self, team_id, date_str=None):
        survey = Survey.get(team_id=team_id)[0]
        if date_str:
            today = datetime.strptime(date_str, config.iso_date_format).date()
        else:
            today = date.today()

        # Cycle ultimately comes from Cycle.get_current_for_team() and so is
        # guaranteed to have start and end dates.
        cycle = survey.should_notify(today)
        if not cycle:
            # This task is run every week, but only actually send notifications
            # if the date matches the survey interval.
            return

        team = Team.get_by_id(survey.team_id)
        program = Program.get_by_id(team.program_id)
        classrooms = Classroom.get(team_id=team_id)
        users = User.query_by_team(team_id)

        if len(classrooms) == 0:
            pct_complete_by_id = {}
        else:
            ppn = get_participation(cycle, classrooms)
            pct_complete_by_id = self.participation_to_pct(ppn, classrooms)

        # Get all the responses once to save trips to the db. Redact them later
        # according to the relevate user.
        unsafe_responses = Response.get_for_teams_unsafe(
            [team_id], parent_id=cycle.uid)

        to_put = []
        for user in users:
            if user.receive_email:
                safe_responses = Response.redact_private_responses(
                    unsafe_responses, user)
                email = cycle_emailers.create_cycle_email(
                    program.label,
                    user,  # recipient
                    users,
                    team,
                    classrooms,
                    safe_responses,
                    cycle,
                    pct_complete_by_id,
                )

                to_put.append(email)

        ndb.put_multi(to_put)

    def participation_to_pct(self, participation, classrooms):
        """Returns an int from 0 to 100 for each classroom.

        Participation is {code: [{'value': x, 'n': y}, ...], ...}
        """
        num_complete_by_code = {}
        for code, counts in participation.items():
            code = code.replace('-', ' ')
            complete_count = next((c for c in counts if c['value'] == '100'),
                                  None)
            complete_n = complete_count['n'] if complete_count else 0
            num_complete_by_code[code] = complete_n

        pct_by_class_id = {}
        for c in classrooms:
            if c.num_students > 0:
                num_complete = num_complete_by_code.get(c.code, 0)
                pct_by_class_id[c.uid] = (num_complete * 100) / c.num_students
            else:
                pct_by_class_id[c.uid] = 0

        return pct_by_class_id


class TeamParticipation(TaskWorker):

    def post(self, team_id, date_str=None):
        if date_str:
            today = datetime.strptime(date_str, config.iso_date_format).date()
        else:
            today = date.today()

        # Guaranteed to have start and end dates.
        cycle = Cycle.get_current_for_team(team_id, today)
        if not cycle:
            logging.info(
                "Either the team doesn't exist, or they don't have a cycle "
                "matching the current date. Doing nothing."
            )
            return

        team = Team.get_by_id(team_id)
        classrooms = Classroom.get(team_id=team_id)

        if len(classrooms) == 0:
            logging.info("No classrooms, setting participation to 0.")
            cycle.students_completed = 0
        else:
            ppn = get_participation(cycle, classrooms)
            num_complete = 0
            for code, counts in ppn.items():
                complete_count = next(
                    (c for c in counts if c['value'] == '100'), None)
                num_complete += complete_count['n'] if complete_count else 0
            cycle.students_completed = num_complete

        cycle.put()


class BackupResponse(TaskWorker):
    """Save a copy of a response to a backup table."""
    def post(self):
        content_types = self.request.headers.get('Content-Type', [])
        if 'application/json' not in content_types:
            raise Exception("/task/backup_response requires JSON content type")

        # This results from a known sane internal call, so we can skip most of
        # the layers we normally use (get_params(), creating objects). First, a
        # dictionary of python-friendly values:
        response_params = json.loads(self.request.body)

        # Then convert values to their MySQL-friendly versions.
        row_dict = ResponseBackup.coerce_row_dict(response_params)

        # The data provided should come from Response.after_put(), so the
        # created and modified times should be correct, they'll need converting
        # to sql format.
        for key in ('created', 'modified'):
            row_dict[key] = util.iso_datetime_to_sql(row_dict[key])

        # Then just insert, with no choice to update anything that might look
        # similar.
        with mysql_connection.connect() as sql:
            affected_rows = sql.insert_row_dicts(
                ResponseBackup.table, [row_dict])

        # There's no unique index or primary key on this table, so we should
        # _always_ get a new row.
        if affected_rows != 1:
            raise Exception("BackupResponses failed to insert a new row.")

task_routes = [
    Route('/task/<user_id>/digest_notifications', DigestUserNotifications),
    Route('/task/<team_id>/cycle_emails', TeamCycleEmails),
    Route('/task/<team_id>/cycle_emails/<date_str>', TeamCycleEmails),
    Route('/task/<team_id>/team_participation', TeamParticipation),
    Route('/task/<team_id>/team_participation/<date_str>', TeamParticipation),
    Route('/task/backup_response', BackupResponse),
]
