"""Helpers for RServe-related cron jobs."""

import json
import logging
import os
from google.appengine.api import urlfetch

from gae_handlers import rserve_jwt
from gae_models import DatastoreModel
from model import Classroom, Organization, Report, SecretValue, Team
import util


def get_report_parents(program, week, should_force):
    # Look up teams and classrooms relevant to the requested script.
    orgs = Organization.get(program_id=program.uid, n=float('inf'))
    teams = Team.get(program_id=program.uid, n=float('inf'))
    classrooms = Classroom.get_by_program(program.uid)

    if should_force:
        # Don't skip any, re-request them all.
        skip_parent_ids = []
    else:
        # Find all the reports for the current period that have already
        # been generated and don't re-request them.
        existing_reports = Report.get(issue_date=week, n=float('inf'))
        skip_parent_ids = [r.parent_id for r in existing_reports]

    return (
        [o for o in orgs if o.uid not in skip_parent_ids],
        [t for t in teams if t.uid not in skip_parent_ids],
        [c for c in classrooms if c.uid not in skip_parent_ids],
    )

def build_payload(orgs, teams, all_classrooms, secrets, ru_whitelist=[]):
    """Compose the request payload RServe expects to start a job.

    Args:
        orgs - list of Organizations, assumed to be limited to one program
        teams - list of Teams, assumed to be limited to one program
        all_classrooms - list of Classrooms, assumed to be limited to one
            program, but their associated team may be missing.
        secrets - dict, various credentials needed by RServe, to be mixed into
            payload
        ru_whitelist - list of uid strings, reporting units in the playload
            will be limited to these
    """
    # Match them up to filter out any orphaned classrooms.
    team_ids = set(t.uid for t in teams)
    classrooms = [c for c in all_classrooms if c.team_id in team_ids]

    # Further filter by whitelist, if present.
    if len(ru_whitelist) > 0:
        orgs = [o for o in orgs if o.uid in ru_whitelist]
        teams = [t for t in teams if t.uid in ru_whitelist]
        classrooms = [c for c in classrooms if c.uid in ru_whitelist]

    rep_unit_entities = orgs + teams + classrooms
    payload = {
        'reporting_units': [
            build_reporting_unit(obj) for obj in rep_unit_entities
        ],
    }

    for s in secrets:
        payload[s] = secrets[s]

    logging.info("organizations: {}".format(len(teams)))
    logging.info("teams: {}".format(len(teams)))
    logging.info("classrooms: {}".format(len(classrooms)))
    logging.info("reporting units:")
    logging.info("\n".join(e.uid for e in rep_unit_entities))

    return payload


def build_reporting_unit(entity):
    """Compose dict describing one unit for which to generate a report."""
    neptune_url_base = '{protocol}://{domain}'.format(
        protocol='http' if util.is_localhost() else 'https',
        domain=('localhost:8888' if util.is_localhost()
                else os.environ['NEPTUNE_DOMAIN']),
    )
    triton_url_base = '{protocol}://{domain}'.format(
        protocol='http' if util.is_localhost() else 'https',
        domain=('localhost:10080' if util.is_localhost()
                else os.environ['HOSTING_DOMAIN']),
    )

    # Assemble the URLs that RServe will need to post back to.
    dataset_url = '{base}/api/datasets?parent_id={parent_id}'.format(
        base=neptune_url_base,
        parent_id=entity.uid,
    )
    report_url = '{base}/api/reports'.format(base=triton_url_base)

    reporting_unit = {
        'id': entity.uid,
        'team_id': None,
        'classroom_id': None,
        'post_url': dataset_url,
        'post_report_url': report_url,
    }
    if DatastoreModel.get_kind(entity) == 'Organization':
        reporting_unit['organization_id'] = entity.uid
    elif DatastoreModel.get_kind(entity) == 'Team':
        reporting_unit['team_id'] = entity.uid
    elif DatastoreModel.get_kind(entity) == 'Classroom':
        # This kind of report needs two ids because it reports on two levels
        # at once. Classroom data is present in the context of team data.
        reporting_unit['team_id'] = entity.team_id
        reporting_unit['classroom_id'] = entity.uid
    return reporting_unit


def get_fetch_params(script, payload):
    """Designed to be used as kwargs in urlfetch.fetch()"""
    return {
        'url': get_url(script),
        'payload': json.dumps(payload),
        'method': urlfetch.POST,
        'headers': {
            'Authorization': 'Bearer ' + rserve_jwt(),
            'Content-Type': 'application/json',
        },
        # This handler should have a 10 minute deadline; wait less here
        # to be safe.
        'deadline': 8 * 60,
    }


def get_secrets(request):
    """Get SecretValues, with options from the API request.

    If `send_email=false` is in the request query string, the mandrill key
    will be omitted, which causes RServe to not sent any email notifications.
    """
    secret_keys = (
        'neptune_sql_credentials',
        'triton_sql_credentials',
        'saturn_sql_credentials',
        'qualtrics_credentials',
        'rserve_service_account_credentials',
    )
    secrets = {s: json.loads(SecretValue.get(s, 'null'))
               for s in secret_keys}

    # Add the mandrill api key, which isn't a JSON string.
    if request.get('send_email', None) != 'false':
        secrets['mandrill_api_key'] = SecretValue.get(
            'mandrill_api_key', '')

    return secrets


def get_url(script):
    return '{protocol}://{domain}/api/scripts/{script}'.format(
        protocol='http' if util.is_localhost() else 'https',
        domain=('localhost:9080' if util.is_localhost()
                else os.environ['RSERVE_DOMAIN']),
        script=script,
    )
