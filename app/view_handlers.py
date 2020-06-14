from google.appengine.api import users as app_engine_users
from google.appengine.api import urlfetch

import datetime
import json
import logging
import os

from api_handlers import TeamsClassrooms
from gae_handlers import ViewHandler, Route
from model import (Classroom, Cycle, Response, Team, User)
from permission import (has_captain_permission, has_contact_permission, owns)
import jwt_helper
import util
import random


# Make sure this is off in production, it exposes exception messages.
debug = util.is_development()


class AdminLogin(ViewHandler):
    """Where App Engine Admins can log in with their google accounts."""
    def get(self):
        self.redirect(app_engine_users.create_login_url())


class Logout(ViewHandler):
    """Clears the user's session, closes connections to google."""
    def get(self):
        self.log_out()

        redirect = self.request.get('redirect') or '/'

        if util.is_localhost():
            # In the SDK, it makes sense to log the current user out of Google
            # entirely (otherwise admins have to click logout twice, b/c
            # existing code will attempt to sign them right in again).
            self.redirect(app_engine_users.create_logout_url(redirect))
        else:
            # In production, we don't want to sign users out of their Google
            # account entirely, because that would break their gmail, youtube,
            # etc. etc. Instead, just clear the cookies on *this* domain that
            # Google creates. That's what self.log_out() does above. So we're
            # done, except for a simple redirect.
            self.redirect(redirect)

class CompletionCertificate(ViewHandler):
    def get(self, user_id=None, team_id=None):
        complete = False

        # Determine authenticated user based on JWT token
        # @todo: can we apply jti or some other rule to make sure this URL isn't
        # inappropriately shareable?
        token = self.request.get('token', None)
        payload, error = jwt_helper.decode(token)
        if not payload or error:
            return self.http_forbidden()

        auth_user = User.get_by_id(payload['user_id'])

        user = User.get_by_id(user_id)
        team = Team.get_by_id(team_id)

        if not user or not team:
            return self.http_not_found()

        # The authenticated user can only retrieve their own certificate.
        # The authenticated user must own the team that they are requesting the
        #   certificate for.
        if not auth_user == user and not owns(auth_user, team):
            return self.http_forbidden()

        classrooms = Classroom.get(
            contact_id=user.uid,
            team_id=team_id,
        )

        cycles = Cycle.get(
            team_id=team_id,
            order='ordinal',
        )

        if len(classrooms) > 0 and len(cycles) > 0:
            cycle_participation = self.get_cycle_participation_pct(
                cycles,
                classrooms,
            )

            participation_complete = self.has_completed_three_cycles(cycle_participation)
        else:
            cycle_participation = [{
                'ordinal': c.ordinal,
                'pct': 0,
            } for c in cycles]
            participation_complete = False

        exit_survey_complete = self.has_completed_exit_survey(
            user,
            team_id,
        )

        if (exit_survey_complete and participation_complete):
            complete = True

        if (complete):
            # If a teacher has successfully completed participation for three
            # cycles, the certificate should not show any incomplete cycles
            # because they aren't relevant for the requirement of receiving the
            # completion certificate. See #1223.
            cycles_to_display = [
                c for c in cycle_participation
                if c['pct'] >= 80
            ][0:3]
        else:
            cycles_to_display = cycle_participation

        if util.is_localhost():
            neptune_protocol = 'http'
            neptune_domain = 'localhost:8080'
        else:
            neptune_protocol = 'https'
            neptune_domain = os.environ['NEPTUNE_DOMAIN']

        self.write(
            'completion.html',
            neptune_protocol=neptune_protocol,
            neptune_domain=neptune_domain,
            complete=complete,
            user_to_display=user,
            team=team,
            cycles_to_display=cycles_to_display,
            exit_survey_complete=exit_survey_complete,
        )

    def get_cycle_participation_pct(self, cycles, classrooms):
        # N.B. This is not the number of unique students on the team. Rather it
        # is the number of times we expect the survey to completed by students
        # to reach 100% participation. Students who are in multiple classrooms
        # are expected to complete the survey multiple times.
        participation_base = sum(cl.num_students for cl in classrooms)

        cycle_participation = []
        for cycle in cycles:
            ppn = self.get_participation_for_cycle(classrooms, cycle)

            num_complete_in_cycle = 0
            for classroom_counts in ppn.values():
                for milestone_counts in classroom_counts:
                    if milestone_counts['value'] == '100':
                        num_complete_in_cycle += milestone_counts['n']

            cycle_participation.append({
                'ordinal': cycle.ordinal,
                'pct': 0 if participation_base == 0 else
                num_complete_in_cycle * 100 / participation_base
            })

        return cycle_participation

    def get_participation_for_cycle(self, classrooms, cycle):
        if not cycle.start_date or not cycle.end_date:
            return {}

        handler = TeamsClassrooms()
        user = User.create(id='triton', email='')
        jwt = handler.classroom_participation_jwt(user, classrooms)

        if util.is_localhost():
            protocol = 'http'
            neptune_domain = 'localhost:8080'
        else:
            protocol = 'https'
            neptune_domain = os.environ['NEPTUNE_DOMAIN']

        start_datetime = datetime.datetime.combine(
                cycle.start_date, datetime.datetime.min.time())
        end_datetime = datetime.datetime.combine(
                cycle.end_date, datetime.datetime.max.time())
        url = (
            '{protocol}://{domain}/api/project_cohorts/participation?{ids}&start={start_date}&end={end_date}'
            .format(
                protocol=protocol,
                domain=neptune_domain,
                ids='&'.join(['uid={}'.format(c.url_code) for c in classrooms]),
                start_date=util.datelike_to_iso_string(start_datetime),
                end_date=util.datelike_to_iso_string(end_datetime),
            )
        )

        result = urlfetch.fetch(
            url=url,
            method=urlfetch.GET,
            headers={'Authorization': 'Bearer {}'.format(jwt)}
        )

        if not result or result.status_code != 200:
            raise Exception("Failed to get participation {}".format(result))

        return json.loads(result.content)

    def participation_to_pct(self, participation, classrooms):
        """Participation is {code: [{'value': x, 'n': y}, ...], ...}"""
        num_complete_by_code = {}
        for code, counts in participation.items():
            code = code.replace('-', ' ')
            complete_count = next((c for c in counts if c['value'] == '100'),
                                  None)
            complete_n = complete_count['n'] if complete_count else 0
            num_complete_by_code[code] = complete_n

        return {
            cl.uid: ((num_complete_by_code.get(cl.code, 0) * 100) / cl.num_students
                     if cl.num_students > 0 else 0)
            for cl in classrooms
        }

    def has_completed_three_cycles(self, participation):
        completed_cycles = [
            p for p in participation if p['pct'] >= 80
        ]
        return len(completed_cycles) >= 3

    def has_completed_exit_survey(self, user, team_id):
        [response] = Response.get(
            user_id=user.uid,
            team_id=team_id,
            module_label='EPExitSurvey',
            progress=100,
        ) or [None]

        if response:
            return True

        return False


class MainApp(ViewHandler):
    """Main front end app."""
    def get(self, *args):
        if util.is_localhost():
            neptune_protocol = 'http'
            neptune_domain = 'localhost:8080'
            triton_protocol = 'http'
            triton_domain = 'localhost:10080'
        else:
            neptune_protocol = 'https'
            neptune_domain = os.environ['NEPTUNE_DOMAIN']
            triton_protocol = 'https'
            triton_domain = os.environ['HOSTING_DOMAIN']
        self.write(
            'index.html',
            neptune_protocol=neptune_protocol,
            neptune_domain=neptune_domain,
            triton_protocol=triton_protocol,
            triton_domain=triton_domain,
            sentry_config_url=os.environ['SENTRY_CONFIG_URL'],
        )


view_routes = [
    Route('/logout', Logout),
    Route('/admin_login', AdminLogin),
    Route('/completion/<user_id>/<team_id>', CompletionCertificate),
    Route(r'/<:.*>', MainApp),
]
