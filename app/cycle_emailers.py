import jinja2
import os

from model import Email, Response

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates/emails'),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True,
)

def create_ep_email(
    program_label,
    recipient,
    users,
    team,
    classrooms,
    responses,
    cycle,
    pct_complete_by_id,
):
    """Render a cycle reminder email.

    Args:
        program_label, e.g. 'ep19'
        recipient - User
        users - all Users on the team
        team - Team
        classrooms - Classrooms, all on the team
        responses - All responses from the team, with no bodies
        cycle - Cycle, current
        pct_complete_by_id - dict, {classroom_id: int}

    Returns: html string
    """
    if team.captain_id == recipient.uid:
        user_classrooms = classrooms
    else:
        user_classrooms = [c for c in classrooms
                           if recipient.uid == c.contact_id]

    # EP Journals are always user-level.
    ids_with_responses = [r.user_id for r in responses if r.user_id]
    journal_statuses = [
        {
            'user_id': u.uid,
            'user_name': u.name,
            'status': ('Complete' if u.uid in ids_with_responses
                       else 'Incomplete'),
        }
        for u in users
    ]
    own_journal_status = next(d for d in journal_statuses
                              if d['user_id'] == recipient.uid)['status']

    params = {
        'user': recipient,
        'is_captain': recipient.uid == team.captain_id,
        'team': team,
        'classrooms': user_classrooms,
        'copilot_url': 'https://{}'.format(os.environ['HOSTING_DOMAIN']),
        'cycle': cycle,
        'pct_complete_by_id': pct_complete_by_id,
        'journal_complete': own_journal_status == 'Complete',
        'journal_statuses': journal_statuses,
    }

    # Why not send these the "normal" way, where we pass the template
    # file name and the template params into the Email entity? Because this
    # is a case where the parameters are quite large and non-trivial to
    # serialize to JSON for storage. Simpler to reduce the incoming data
    # to the rendered html body and store that in the entity.
    template = jinja_env.get_template('{}/cycle_progress.html'.format(
        program_label))
    return Email.create(
        to_address=recipient.email,
        subject="Engagement Project: Progress Update",
        html=template.render(**params)
    )

def create_cycle_email(program_label, *args):
    emailers = {
        'ep19': create_ep_email,
    }
    return emailers[program_label](program_label, *args)
