from google.appengine.api import taskqueue
from google.appengine.api import urlfetch
from oauth2client.service_account import ServiceAccountCredentials
import cloudstorage as gcs
import datetime
import googleapiclient.discovery
import json
import logging
import os


from big_query_api import BigQueryApi
from gae_handlers import (BackupSqlToGcsHandler, CleanGcsBucket, CronHandler,
                          Route)
from model import (
    Classroom,
    Email,
    ErrorChecker,
    Notification,
    Program,
    Report,
    SecretValue,
    Team,
    User,
)
import config
import cron_rserve
import slow_query
import util


class SendPendingEmail(CronHandler):
    """See model.Email for details."""
    def get(self):
        emails = Email.send_pending_email()
        self.write(emails)


class CheckForErrors(CronHandler):
    """Send emails to devs about errors in production."""
    def get(self):
        """Check for new errors - email on error.
        Must be called with internal_api for full permissions.
        See named_model@Index for full description.
        """

        checker = ErrorChecker.get_or_insert('the error checker')
        result = checker.check()
        checker.put()
        self.write(result)


class DigestNotifications(CronHandler):
    def get(self):
        # Takes query string param `today`, which defaults to a date string for
        # today, if today is a Monday, else next Monday.
        start = self.request.get('start', None)
        end = self.request.get('end', None)

        # What time period is of interest?
        if start and end:
            # Make sure inputs are formatted correctly
            datetime.datetime.strptime(start,  config.iso_datetime_format)
            datetime.datetime.strptime(end,  config.iso_datetime_format)
            if start > end:
                raise Exception("DigestNotifications requires end > start.")
            logging.info("Received custom start and end times: {} - {}"
                         .format(start, end))
        else:
            # most recent midnight, pacific standard time
            today = datetime.date.today()
            end = datetime.datetime(today.year, today.month, today.day, 8)
            start = end - datetime.timedelta(hours=24)
            # from here forward we'll work in ISO 8601 strings.
            start = util.datelike_to_iso_string(start)
            end = util.datelike_to_iso_string(end)
            logging.info("Using default start and end times: {} - {}"
                         .format(start, end))

        user_ids = Notification.users_with_notifications(start, end)

        # Launch a task to process each user. This way we can handle arbitrary
        # growth in the number of users without worrying about time or memory
        # limits, assuming number of notifications per user is fairly constant.
        for id in user_ids:
            taskqueue.add(
                url='/task/{}/digest_notifications'.format(id),
                params={'start': start, 'end': end},
                queue_name='default',
            )

        logging.info(user_ids)
        self.response.write(json.dumps({'user_ids': user_ids}))


class CycleEmails(CronHandler):
    def get(self):
        # Launch a separate task to create emails for each team, to make sure
        # we can scale memory and cpu time easily.
        teams = Team.get()
        programs_by_id = {p.uid: p for p in Program.get()}
        for team in teams:
            if programs_by_id[team.program_id].send_cycle_email:
                taskqueue.add(
                    url='/task/{}/cycle_emails'.format(team.uid),
                    queue_name='default',
                )

        team_ids = [t.uid for t in teams]
        logging.info(team_ids)
        self.response.write(json.dumps({'team_ids': team_ids}))


class TeamParticipation(CronHandler):
    """Make it easy to read the percent of students completing the survey
    across a whole team in a given cycle by querying it periodically and
    storing it with the cycle.
    """
    def get(self, date_str=None):
        try:
            # Make sure this is a valid date.
            datetime.datetime.strptime(date_str, config.iso_date_format)
        except:
            date_str = util.datelike_to_iso_string(datetime.date.today())

        # Launch a separate task to get participation for each team, to make
        # sure we can scale memory and cpu time easily.
        teams = Team.get(n=float('inf'))
        for t in teams:
            taskqueue.add(
                url='/task/{}/team_participation/{}'.format(t.uid, date_str),
                queue_name='default',
            )

        team_ids = [t.uid for t in teams]
        logging.info("Started tasks for {} teams".format(len(team_ids)))
        self.response.write(json.dumps({'team_ids': team_ids}))


class RServeReports(CronHandler):
    def get(self, script):
        """Describe for RServe all the classrooms and teams that we'd like
        reports on, including what URLs to post the report data back to."""

        week = self.request.get('week', None)
        if not week:
            monday = datetime.date.today()
            while monday.weekday() != 0:
                monday = monday + datetime.timedelta(days=1)
            week = util.datelike_to_iso_string(monday)

        should_force = self.request.get('force', 'false') == 'true'
        really_send = self.request.get('really_send', 'true') == 'true'

        script_to_label = {
            'ep': 'ep19',
            'beleset': 'beleset19',
            'cset': 'cset19',
            'mset': 'mset19',
        }
        program = Program.get_by_label(script_to_label[script])

        # Manual calls to this handler may specify reporting unit ids.
        # We'll use them as a whitelist to filter what we query.
        reporting_unit_ids = self.request.get_all('ru') or []

        # What reporting units should get reports this week? If should_force is
        # true, this function will return all possible units for the program.
        # Otherwise it will ignore units that already have reports.
        orgs, teams, classrooms = cron_rserve.get_report_parents(
            program, week, should_force)

        payload = cron_rserve.build_payload(
            orgs,
            teams,
            classrooms,
            cron_rserve.get_secrets(self.request),
            ru_whitelist=reporting_unit_ids,
        )
        fetch_params = cron_rserve.get_fetch_params(script, payload)

        if not really_send:
            logging.info("really_send is false, not contacting RServe.")
            # More convenient to see payload parsed rather than dumpsed.
            fetch_params['payload'] = payload
            self.write(fetch_params)
            return

        try:
            result = urlfetch.fetch(**fetch_params)
        except urlfetch.DeadlineExceededError as e:
            logging.warning(
                "RServe took a long time to reply (caught a "
                "DeadlineExceededError). Exiting without checking "
                "results. Original error message follows."
            )
            logging.warning(e.message)
            return

        if not result:
            raise Exception("No response from RServe.")

        if result.status_code >= 300:
            # App Engine will consider this cron job to have failed, and will
            # follow any retry instructions in cron.yaml.
            raise Exception("Non-successful response from RServe: {} {}"
                            .format(result.status_code, result.content))

        logging.info("response status: {}".format(result.status_code))
        try:
            json.loads(result.content)
            # ok, it's valid
            logging.info(util.truncate_json(result.content))
            logging.info(result.content)
        except:
            # just log as text
            logging.info(result.content)


class RServeStatus(CronHandler):
    """Use the app engine api to switch RServe on and off explicitly.

    This saves money because 1) RServe is in the flexible environment, which
    can't scale down to zero instances when not in use and 2) we use
    expensive, high-memory instances.
    """
    def get(self, action=None):
        creds = SecretValue.get('rserve_service_account_credentials')
        scopes = ['https://www.googleapis.com/auth/cloud-platform']

        credentials = ServiceAccountCredentials.from_json_keyfile_dict(
            json.loads(creds), scopes=scopes)
        gae_api = googleapiclient.discovery.build(
            'appengine', 'v1', credentials=credentials)
        # Corresponds to: https://cloud.google.com/appengine/docs/admin-api/reference/rest/v1/apps.services.versions/patch
        request = gae_api.apps().services().versions().patch(
          appsId='rserveplatform',
          # versionsId='production',
          # Temporarily running RServe in the development version to test new
          # Codeship-deployed code. Then we can easily roll back if we have to.
          versionsId='development',
          servicesId='default',
          body={'servingStatus': action.upper()},
          updateMask='servingStatus',
        )
        # Allow any exceptions raised by the api to cause a 500.
        response = request.execute()
        self.write(response)


class ReleasePreviews(CronHandler):
    def get(self):
        # Takes query string param `week`, which defaults to a date string for
        # today, if today is a Monday, else next Monday.
        week = self.request.get('week', None)

        if not week:
            monday = datetime.date.today()
            while monday.weekday() != 0:
                monday = monday + datetime.timedelta(days=1)
            week = monday.strftime(config.iso_date_format)

        self.write({'num_reports_released': self.release_and_notify(week)})

    def release_and_notify(self, week):
        # Update all reports for a given week and set preview = False, _and_
        # create notifications for all related users.

        # Capture which reports are previews before we release them. We'll base
        # the notifications on this list to make sure we're not notifying about
        # any reports that aren't previews.
        reports_to_release = Report.get_previews(week)

        # This is the "release" part.
        num_reports_released = Report.release_previews(week)

        # Now we have to load a bunch of data from the related teams,
        # classrooms, and users in order to create notifications.
        if len(reports_to_release) != num_reports_released:
            logging.error(
                "Report.get_previews() ({}) and Report.release_previews() "
                "({}) didn't hit the same number of rows."
                .format(len(reports_to_release), num_reports_released)
            )

        team_ids = {r.team_id for r in reports_to_release}
        classroom_ids = {r.classroom_id for r in reports_to_release
                         if r.classroom_id}

        # Load all related teams and classrooms as a batch.
        teams = Team.get_by_id(team_ids)
        classrooms = Classroom.get_by_id(classroom_ids)

        t_index = {t.uid: t for t in teams}
        c_index = {c.uid: c for c in classrooms}
        p_index = {p.uid: p for p in Program.get()}
        notes = []
        for r in reports_to_release:
            team = t_index.get(r.team_id)
            program = p_index.get(team.program_id)
            classroom = c_index.get(r.classroom_id, None)
            result = self.notify_for_single_report(program, team, classroom)
            # result might be a list or None
            if result:
                notes += result

        Notification.put_multi(notes)

        return num_reports_released

    def notify_for_single_report(self, program, team, classroom=None):
        """Notifications for class contact or all members re: one report."""
        if not team.report_reminders:
            logging.info("{} has report reminders disabled; not notifying"
                         .format(team.uid))
            return

        if classroom:
            recipients = [User.get_by_id(classroom.contact_id)]
        else:
            recipients = User.query_by_team(team.uid)

        protocol = 'http' if util.is_localhost() else 'https'
        # Note that reports are hosted by the local _backend_ gae sdk, not the
        # react-app dev server on :3000. But for now we're just pointing to the
        # list of a team's reports, which _is_ on :3000.
        domain = ('localhost:3000' if util.is_localhost()
                  else os.environ['HOSTING_DOMAIN'])

        reports_page = '{}://{}/teams/{}/reports'.format(
            protocol, domain, team.short_uid)

        # If we do want to link directly to the report, we'll have to wrestle
        # with authentication and what that looks like. We can either generate
        # a token right here (but that would be the link was shareable, and it
        # would expire, both of which seem wrong) or build some additional
        # client code that would know how to redirect an unauthed user to
        # login and back.

        notes = []
        for user in recipients:
            notes.append(Notification.create(
                user_id=user.uid,
                type='report',
                template_params={
                    'context_name': classroom.name if classroom else team.name,
                    'first_name': user.first_name,
                    'program_name': program.name,
                    'url': reports_page,
                }
            ))
        return notes


class ExportSlowQueryLog(CronHandler):
    def get(self):
        log_bucket = 'tritonplatform-logs'
        log_dataset = 'triton_logs'
        log_table = 'slow_log'

        with BigQueryApi() as bq:
            bq.ensure_dataset(log_dataset)
            bq.ensure_table(log_dataset, log_table, schema=slow_query.schema)

            num_fragments = 0
            num_entries = 0
            failed_insertions = 0
            for lines, file_name in slow_query.json_batch_gen(log_bucket):
                entries = slow_query.json_lines_to_entries(lines)
                slow_query_rows = [
                    slow_query.to_slow_schema(e) for e in entries.values()
                ]

                status, response_body = bq.insert_data(
                    log_dataset,
                    log_table,
                    slow_query_rows,
                    insert_id_field='timestamp',
                )

                if status == 200:
                    gcs.delete(file_name)
                    num_fragments += 1
                    num_entries += len(entries)
                else:
                    failed_insertions += 1
                    logging.warning("Failed to insert: {}".format(file_name))

        self.write({
            "message": "log fragments exported",
            "num_fragments": num_fragments,
            "num_entries": num_entries,
            "failed_insertions": failed_insertions,
        })


cron_routes = [
    Route('/cron/check_for_errors', CheckForErrors),
    Route('/cron/digest_notifications', DigestNotifications),
    Route('/cron/send_pending_email', SendPendingEmail),
    Route('/cron/cycle_emails', CycleEmails),
    Route('/cron/team_participation', TeamParticipation),
    Route('/cron/team_participation/<date_str>', TeamParticipation),
    Route('/cron/rserve/reports/<script:(ep|beleset|cset)>', RServeReports),
    Route('/cron/rserve/status/<action:(serving|stopped)>', RServeStatus),
    Route('/cron/release_previews', ReleasePreviews),
    Route('/cron/export_slow_query_log', ExportSlowQueryLog),
    Route('/cron/sql_backup/<instance>/<db>/<bucket>', BackupSqlToGcsHandler),
    Route('/cron/clean_gcs_bucket/<bucket>', CleanGcsBucket),
]
