"""What relationships (ownership, association...) do users have to things?"""

import logging

from model import (SqlModel, Classroom, Cycle, Digest, Organization,
                   Participant, Metric, Network, Report, Response, Survey,
                   Team, User)


def owns(user, id_or_entity):
    """Does this user own the object in question?"""

    # Supers own everything.
    if user.super_admin:
        return True

    # Standardize id vs. entity, saving db trips where possible.
    # Also, javascript-like closures are surprisingly hard in python.
    # https://stackoverflow.com/questions/2009402/read-write-python-closures
    class entity_closure(object):
        def __init__(self, id_or_entity):
            if isinstance(id_or_entity, basestring):
                self.uid = str(id_or_entity)
                self._entity = None
            else:
                self.uid = id_or_entity.uid
                self._entity = id_or_entity
            self.kind = SqlModel.get_kind(self.uid)

        def __call__(self):
            # Calling code may have pulled the entity for us already, no sense
            # in doing it again; on the other hand, merely an id may be
            # sufficient, depending on the kind, so only run this code if its
            # called.
            if self._entity is None:
                self._entity = SqlModel.kind_to_class(kind).get_by_id(self.uid)
            return self._entity

    get_entity = entity_closure(id_or_entity)
    kind, uid = get_entity.kind, get_entity.uid

    if kind == 'Classroom':
        classroom = get_entity()
        team = Team.get_by_id(classroom.team_id)
        team_member = classroom.team_id in user.owned_teams
        owns = team_member or is_supervisor_of_team(user, team)
    elif kind == 'Digest':
        digest = get_entity()
        owns = user.uid == digest.user_id
    elif kind == 'Metric':
        owns = False  # only supers
    elif kind == 'Organization':
        owns = (uid in user.owned_organizations or
                uid in user.get_networked_organization_ids())
    elif kind == 'Network':
        owns = uid in user.owned_networks
    elif kind == 'Team':
        # Users can own a team directly ("team member"), or can own one of the
        # organizations associated with the team.
        team = get_entity()
        owns = uid in user.owned_teams or is_supervisor_of_team(user, team)
    elif kind == 'Survey':
        survey = get_entity()
        team = Team.get_by_id(survey.team_id)
        team_member = survey.team_id in user.owned_teams
        owns = team_member or is_supervisor_of_team(user, team)
    elif kind == 'Report':
        report = get_entity()
        if report.classroom_id:
            classroom = Classroom.get_by_id(report.classroom_id)
            owns = user.uid == classroom.contact_id
        else:
            team = Team.get_by_id(report.team_id)
            team_member = report.team_id in user.owned_teams
            owns = team_member or is_supervisor_of_team(user, team)
    elif kind == 'Cycle':
        cycle = get_entity()
        team = Team.get_by_id(cycle.team_id)
        owns = (cycle.team_id in user.owned_teams or
                is_supervisor_of_team(user, team))
    elif kind == 'Response':
        response = get_entity()
        team = Team.get_by_id(response.team_id)
        owns = (
            response.user_id == user.uid or
            (
                response.type == Response.TEAM_LEVEL_SYMBOL and (
                    response.team_id in user.owned_teams or  # members, captain
                    is_supervisor_of_team(user, team)  # org supervisors
                )
            )
        )
    elif kind == 'Participant':
        ppnt = get_entity()
        classrooms = Classroom.get_by_id(ppnt.classroom_ids)
        team = Team.get_by_id(ppnt.team_id)
        owns = (
            any(has_contact_permission(user, c) for c in classrooms) or
            has_captain_permission(user, team)
        )
    elif kind == 'User':
        owns = uid == user.uid  # no slavery!
    else:
        raise Exception("Ownership does not apply to " + uid)

    return owns


def is_supervisor_via_org(user, team):
    return len(
        set(user.owned_organizations).intersection(set(team.organization_ids))
    ) > 0


def is_supervisor_via_network(user, team):
    # For all the networks the user owns, get a unique set of all the orgs they
    # are associated with.
    org_ids = user.get_networked_organization_ids()

    # If there's any overlap between the team's orgs, and the orgs in the
    # user's networks, then they're a network admin.
    return len(org_ids.intersection(set(team.organization_ids))) > 0


def is_supervisor_of_team(user, team):
    if not team:
        # Some unit tests don't bother to fully mock teams. Safe option is to
        # deny permission if teams aren't found.
        return False

    if is_supervisor_via_org(user, team):
        # Return early to avoid calculating network relationships, b/c they
        # could involve multiple db lookups.
        return True

    return is_supervisor_via_network(user, team)


def has_captain_permission(user, team):
    if not team:
        # Some unit tests don't bother to fully mock teams. Safe option is to
        # deny permission if teams aren't found.
        return False
    return (
        user.uid == team.captain_id or
        is_supervisor_of_team(user, team) or
        user.super_admin
    )


def has_contact_permission(user, classroom):
    return user.uid == classroom.contact_id or user.super_admin


def team_membership_removal_allowed(subject, requestor, params):
    """Is the requestor allowed to remove the subject from a team?"""
    if 'owned_teams' not in params:
        return False

    removed_ids = set(subject.owned_teams).difference(params['owned_teams'])
    if len(removed_ids) == 0:
        # We're not removing teams, no need to provide permission.
        return False
    if len(removed_ids) > 1:
        logging.info("Team membership can only be revoked one team at a time.")
        return False

    team = Team.get_by_id(removed_ids.pop())  # may be None

    return (
        # Case 1: Requestor is team captain of team being removed.
        (team and has_captain_permission(requestor, team)) or
        # Case 2: Remove oneself from a team.
        subject.uid == requestor.uid or
        # Case 3: Requestor is super_admin
        requestor.super_admin
    )


def organization_membership_removal_allowed(subject, requestor, params):
    """Is the requestor allowed to remove the subject from a organization?"""
    if 'owned_organizations' not in params:
        return False

    removed_ids = set(subject.owned_organizations).difference(
        params['owned_organizations'])

    if len(removed_ids) == 0:
        # We're not removing orgs, no need to provide permission.
        return False
    if len(removed_ids) > 1:
        logging.info("Organization membership can only be revoked one org at a time.")
        return False

    organization_id = removed_ids.pop()

    # Last member an organization is not allowed to leave.
    organization_users = User.query_by_organization(organization_id)
    if (len(organization_users) == 1):
        logging.info("Organization membership cannot be revoked when last user.")
        return False

    # Case 1: Requestor is an admin of the org being removed
    # Case 2: Requestor is super_admin
    return (
        organization_id in requestor.owned_organizations or
        requestor.super_admin
    )
