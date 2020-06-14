"""URL Handlers are designed to be simple wrappers over our python API layer.
They generally convert a URL directly to an API function call.
"""

from google.appengine.api import memcache
from google.appengine.api import users as app_engine_users
import json
import logging
import os

from gae_handlers import ApiHandler, RestHandler, InvalidParamType, Route
from handlers import (Emails, MandrillTemplates, Networks, NetworkCode,
                      UsersNetworks, OrganizationDashboards, Programs,
                      ProgramsSearch, ReportPdf, Reports, Responses,
                      ParentReports, TeamsResponses)
from model import (Model, SqlModel, Classroom, Cycle, Digest, Email, Metric,
                   Notification, Organization, Participant, Program, Report,
                   SecretValue, Survey, Team, JsonTextValueLengthError,
                   JsonTextDictLengthError, User)
from permission import (has_captain_permission, has_contact_permission, owns,
                        organization_membership_removal_allowed,
                        team_membership_removal_allowed)
from related_query import RelatedQuery
from util import PermissionDenied
import config
import jwt_helper
import mysql_connection
import util


# Make sure this is off in production, it exposes exception messages.
debug = util.is_development()


class Invitations(ApiHandler):
    requires_auth = True

    def post(self, override_permissions=False):
        """To invite people to create accounts on Neptune.

        Also supports adding relationships to invitee, if the inviter has
        the right permission.
        """
        user = self.get_current_user()

        params = self.get_params({
            'user_id': str,
            'email': unicode,
            'name': unicode,
            'phone_number': str,
            # Optional things to associate to the invited user.
            'team_id': str,
            'organization_id': str,
        })
        team_id = params.pop('team_id', None)
        organization_id = params.pop('organization_id', None)

        relationships = [
            (team_id, 'team'),
            (organization_id, 'organization'),
        ]

        for id, kind in relationships:
            if not id:
                continue
            # If this invitation also creates relationships, the user
            # needs to own the related object (or be a super admin).
            forbidden = not owns(user, id)
            if forbidden:
                logging.error("{} tried to invite {} to a {} they don't own: {}"
                              .format(user, params['email'], kind, team_id))
                return self.http_forbidden("You don't own that " + kind)
            klass = Model.kind_to_class(Model.get_kind(id))
            related = klass.get_by_id(id)
            if not related:
                return self.http_bad_request("{} not found.".format(kind))

        # Determine one of several cases:
        # 1. User is new and is being added to an obj
        # 2. User is new and is not being added to an obj (already on the obj
        #    / no obj specified)
        # 3. User exists and is being added to an obj
        # 4. User exists and is not being added to an obj (already on the obj
        #    / no obj specified)

        matches = User.get(email=params['email'])
        if len(matches) > 0:
            recipient = matches[0]
            account_created = False
        else:
            # If the user doesn't exist, create them.
            recipient = User.create(
                id=User.convert_uid(params['user_id']),
                email=params['email'],
                name=params.get('name', None) or None,  # replace '' with None
                phone_number=params.get('phone_number', None) or None,
            )
            account_created = True

        relationship_added = False
        for id, kind in relationships:
            owned_list = getattr(recipient, 'owned_{}s'.format(kind))
            # Give recipient access if inviter requested it.
            if id and id not in owned_list:
                owned_list.append(id)
                relationship_added = True

        if account_created or relationship_added:
            recipient.put()

        self.write('new user' if account_created else 'existing user')


class Version(ApiHandler):
    def get(self):
        """A do-nothing endpoint to quickly demo jwts are one-time use."""
        with open('package.json', 'r') as fh:
            version = json.loads(fh.read())['version']
        self.write(version)


class Accounts(RestHandler):
    requires_auth = True

    def get(self, email):
        user = User.get_by_auth('email', email)
        if (user):
            self.write(user)
        else:
            self.error(404)


class Users(RestHandler):
    model = User
    requires_auth = True

    def put(self, id=None):
        # Allowing user updates is generally a security risk. We don't want to
        # allow:
        # * Users to change their user type and escalate their privileges.
        # * Users to change their relationships and gain access to data they
        #   shouldn't see.
        # Therefore whitelist properties that are safe.

        if id is None:
            # Collection has no PUT
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD'
            return

        id = self.model.get_long_uid(id)
        req_user = self.get_current_user()
        params = self.get_params(self.model.property_types())

        entity = self.model.get_by_id(id)

        # May also include 'owned_teams' in certain circumstances.
        safe_props = ['name', 'phone_number', 'receive_email', 'receive_sms',
                      'consent', 'recent_program_id']

        if team_membership_removal_allowed(entity, req_user, params):
            safe_props.append('owned_teams')
        elif organization_membership_removal_allowed(entity, req_user, params):
            safe_props.append('owned_organizations')
        elif not owns(req_user, id):
            return self.http_forbidden()

        # Here's where we enforce only changing certain properties.
        safe_params = {k: v for k, v in params.items() if k in safe_props}
        for k, v in safe_params.items():
            setattr(entity, k, v)
        entity.put()
        self.write(entity)

    def post(self):
        self.not_allowed()

    def delete(self, id=None):
        self.not_allowed()

    def not_allowed(self):
        self.error(405)
        self.response.headers['Allow'] = 'GET, HEAD, PUT'


class TeamsUsers(RestHandler):
    model = User
    requires_auth = True

    def get(self, team_id, user_id=None):
        user = self.get_current_user()
        team = Team.get_by_id(team_id)

        if not team:
            self.write(json.dumps("Team not found."))
            self.error(404)
            return

        if not owns(user, team):
            self.write(json.dumps("You're not a member of that team."))
            self.error(403)
            return

        if user_id is None:
            results = [u.to_client_dict(is_self=u.uid == user.uid)
                       for u in User.query_by_team(team.uid)]
        else:
            # Okay to just get the requested user, since we've verified the
            # requester owns the team. This is not allowed in general, e.g.
            # via GET /api/users/X.
            u = User.get_by_id(user_id)
            if not u:
                return self.http_not_found()
            results = u.to_client_dict(is_self=u.uid == user.uid)

        self.write(results)

    def post(self, *args, **kwargs):
        self.not_allowed()

    def put(self, *args, **kwargs):
        self.not_allowed()

    def delete(self, *args, **kwargs):
        self.not_allowed()

    def not_allowed(self):
        self.error(405)
        self.response.headers['Allow'] = 'GET, HEAD'


class Organizations(RestHandler):
    model = Organization
    requires_auth = True

    def query(self, override_permissions=False):
        if 'order' not in self.request.GET:
            self.request.GET['order'] = 'name'
        program_label = self.request.GET.pop('program', None)
        if program_label:
            program = Program.get_by_label(program_label)
            if not program:
                self.write([])
                return
            self.request.GET['program_id'] = program.uid
        super(Organizations, self).query(
            override_permissions=override_permissions)

    def post(self):
        """Anyone can create an org.

        Same as RestHandler.post, but
        * removes permission check
        """
        user = self.get_current_user()
        params = self.get_params(self.model.property_types())

        # Sanity check program.
        program = Program.get_by_id(params['program_id'])
        if not program:
            return self.http_bad_request("Program not found.")
        if not program.active:
            return self.http_bad_request("Program is inactive.")

        # Codes are not set on POST. They're generated randomly by create()
        # and can be changed to a new random value later.
        params.pop('code', None)

        # Create org.
        org = self.model.create(**params)
        org.put()

        # Associate with creating user.
        p = user.get_owner_property(org)
        if p is not None:
            p.append(org.uid)
            user.put()

        self.send_welcome_email(program, user)

        self.write(org)
        return org

    def put(self, id=None):
        """Don't let people change the org code with a PUT.

        Because we use a unique key on that field, and all our INSERTs have
        ON DUPLICATE KEY UPDATE, a PUT with a code that matched a different org
        would update that _other org_, which is fubar.
        """
        unsafe_props = ('code',)
        params = self.get_params(self.model.property_types())
        safe_params = {k: v for k, v in params.items() if k not in unsafe_props}

        # Change the request to only have the safe params.
        self.override_json_body(safe_params)

        return super(Organizations, self).put(id)

    def delete(self, id=None):
        """Change default rules to disassociate teams."""
        super(Organizations, self).delete(id)

        # Look up related teams and remove their association.
        teams = Team.query_by_organization(id)
        for team in teams:
            if id in team.organization_ids:
                team.organization_ids.remove(id)
        Team.put_multi(teams)

        # Look up other org owners, and remove their association.
        users = User.query_by_organization(id)
        for user in users:
            if id in user.owned_organizations:
                user.owned_organizations.remove(id)
        User.put_multi(users)

    def send_welcome_email(self, program, user):
        """If, on POST, user is org admin of one org for the program.

        Not all programs have a welcome email. Only send if there's a matching
        template.
        """
        template_dir = 'templates/emails/'
        template_path = '{}/org_welcome.html'.format(program.label)
        if not os.path.isfile(template_dir + template_path):
            return

        created_orgs = Organization.query_by_user(user, program.uid)
        if len(created_orgs) != 1:
            return

        # The user is currently part of exactly one org in this program.
        # Assume it is their first and send them a welcome email.
        email = Email.create(
            to_address=user.email,
            bcc_address=(
                [config.from_server_email_address] +
                config.to_program_team_email_addresses
            ),
            subject=u"Welcome to {}!".format(program.name),
            template=template_path,
            template_data={'user_name': user.name},
        )
        email.put()


class OrganizationCode(ApiHandler):
    model = Organization
    requires_auth = True

    def post(self, id):
        if not owns(self.get_current_user(), id):
            return self.http_forbidden("You don't own that organization.")

        org = Organization.get_by_id(id)
        if not org:
            return self.http_not_found()

        org.code = Organization.generate_unique_code()
        org.put()

        self.write(org)


class UsersOrganizations(ApiHandler):
    model = Organization
    requires_auth = True

    def get(self, user_id):
        user = self.get_current_user()

        program_label = self.request.GET.pop('program', None)
        if program_label:
            program = Program.get_by_label(program_label)
            if not program:
                self.write([])
                return
            program_id = program.uid
        else:
            program_id = None

        if not owns(user, user_id):
            return self.http_forbidden("Can't list orgs for someone else.")

        self.write(Organization.query_by_user(user, program_id=program_id))


class TeamsOrganizations(ApiHandler):
    model = Organization
    requires_auth = True

    def get(self, team_id):
        user = self.get_current_user()
        team = Team.get_by_id(team_id)

        if not team:
            return self.http_not_found()

        if not owns(user, team_id):
            return self.http_forbidden("You're not on that team.")

        self.write(Organization.query_by_team(team_id))

    def post(self, team_id):
        """For adding an organization to a team, requires org's invite code."""
        user = self.get_current_user()
        team = Team.get_by_id(team_id)

        if not team:
            return self.http_not_found()

        if not has_captain_permission(user, team):
            return self.http_forbidden("Must be team captain to add orgs.")

        multi_code = self.get_param('organization_code', str, None)
        if not multi_code:
            return self.http_bad_request("Must include org code.")

        codes = [c.strip() for c in multi_code.split(',')]
        orgs_joined = []
        for code in codes:
            matches = Organization.get(code=code)
            org = matches[0] if len(matches) else None
            if not org:
                return self.http_bad_request("Invalid organization code(s).")

            if org.program_id != team.program_id:
                return self.http_bad_request(
                    "Organizations must be in same program.")

            if org.uid not in team.organization_ids:
                team.organization_ids.append(org.uid)
                orgs_joined.append(org)

        team.put()

        self.write(orgs_joined)


class OrganizationReportData(ApiHandler):
    requires_auth = True

    def get(self, id):
        org = Organization.get_by_id(id)
        if not org:
            return self.http_not_found()

        user = self.get_current_user()

        if not self.allowed_by_jwt:
            if user.user_type == 'public':
                return self.http_unauthorized()
            if not owns(user, org):
                return self.http_forbidden()
            # else you are someone who owns the org and have rights to see this
            # data even w/o a jwt allowing this endpoint explicitly.
        # else your jwt allows this endpoint explicitly

        program = Program.get_by_id(org.program_id)
        teams = Team.query_by_organization(id)
        cycles = Cycle.query_by_teams([t.uid for t in teams])

        captain_ids = list(set(t.captain_id for t in teams))
        users_by_id = {u.uid: u for u in User.get_by_id(captain_ids)}

        team_dicts = [t.to_client_dict() for t in teams]
        for t in team_dicts:
            t['captain_name'] = users_by_id[t['captain_id']].name
            t['captain_email'] = users_by_id[t['captain_id']].email

        self.write({
            'program': program.to_client_dict(),
            'teams': team_dicts,
            'cycles': [c.to_client_dict() for c in cycles],
        })


class Teams(RestHandler):
    model = Team
    requires_auth = True

    def query(self, override_permissions=False):
        if 'order' not in self.request.GET:
            self.request.GET['order'] = 'name'
        program_label = self.request.GET.pop('program', None)
        if program_label:
            program = Program.get_by_label(program_label)
            if not program:
                self.write([])
                return
            self.request.GET['program_id'] = program.uid
        super(Teams, self).query(override_permissions=override_permissions)

    def get(self, id=None):
        """Override to add allowed endpoints for neptune participation."""
        if id is None:
            return self.query()
        team = super(Teams, self).get(id)
        if self.response.has_error():
            return

        user = self.get_current_user()

        # Construct a participation endpoint for every classroom on the team.
        payload = jwt_helper.get_payload(self.get_current_user())
        classrooms = Classroom.get(team_id=id)

        def get_endpoint(resource):
            def f(c):
                return self.get_endpoint_str(
                    'GET',
                    'neptune',
                    '/api/project_cohorts/{}/{}'.format(c.url_code, resource),
                )
            return f

        ppn_endpoints = map(get_endpoint('participation'), classrooms)

        # Also construct completion endpoints (more sensitive) just for the
        # classrooms this user is contact of. Captain can see them all. This
        # just excludes non-captains from seeing the individual completion of
        # other team-members.
        if has_captain_permission(user, team):
            allowed_classes = classrooms
        else:
            allowed_classes = [c for c in classrooms
                               if has_contact_permission(user, c)]
        cmp_endpoints = map(get_endpoint('completion'), allowed_classes)

        payload['allowed_endpoints'] = ppn_endpoints + cmp_endpoints
        self.set_jwt(jwt_helper.encode(payload))

    def post(self):
        """Anyone can create a team.

        * adds default captain id
        * checks for org association
        * creates a survey
        * survey has program-defined metrics
        * may create program-defined cycles
        """
        user = self.get_current_user()
        params = self.get_params(self.model.property_types())

        # Sanity check program.
        program = Program.get_by_id(params['program_id'])
        if not program:
            return self.http_bad_request("Program not found.")
        if not program.active:
            return self.http_bad_request("Program is inactive.")

        # Only associate cords via codes.
        if params.get('organization_ids', []):
            return self.http_bad_request(
                "Can't create teams with `organization_ids`, use "
                "`organization_code`."
            )

        # Sanity check organization code.
        params['organization_ids'] = []
        multi_code = self.get_param('organization_code', str, None)
        if multi_code:
            codes = [c.strip() for c in multi_code.split(',')]
            for code in codes:
                matches = Organization.get(code=code)
                org = matches[0] if len(matches) else None
                if not org:
                    return self.http_bad_request("Invalid organization_code.")

                # Check that org program matches program_id
                if org.program_id != params['program_id']:
                    return self.http_bad_request("Org not in the same program.")

                # All valid; associate.
                params['organization_ids'].append(org.uid)

        # Sanity check captain.
        captain_id = params.get('captain_id', None)
        if captain_id and captain_id != user.uid:
            self.error(400)
            self.write("Cannot specify someone else as captain.")
            return
        params['captain_id'] = user.uid

        # Create team.
        team = self.model.create(**params)
        try:
            team.put()
        except JsonTextValueLengthError:
            return self.http_payload_too_large("Value too long.")
        except JsonTextDictLengthError:
            return self.http_payload_too_large("Team data has too many keys.")

        # Associate with creating user.
        p = user.get_owner_property(team)
        if p is not None:
            p.append(team.uid)
            user.put()

        # Create the team's survey (teams and surveys are 1-to-1).
        survey = Survey.create_for_team(team)
        survey.put()

        # Create any cycles required by the team's program.
        cycles = Cycle.create_for_team(team)
        Cycle.put_multi(cycles)

        self.send_welcome_email(program, user)

        self.write(team)
        return team

    def send_welcome_email(self, program, user):
        """If, on POST, user is captain of one team for the program.

        Not all programs have a welcome email. Only send if there's a matching
        template.
        """
        template_dir = 'templates/emails/'
        template_path = '{}/welcome.html'.format(program.label)
        if not os.path.isfile(template_dir + template_path):
            return

        created_teams = Team.get(program_id=program.uid, captain_id=user.uid)
        if len(created_teams) != 1:
            return

        # The user is currently captain of exactly one team in this program.
        # Assume it is their first and send them a welcome email.
        email = Email.create(
            to_address=user.email,
            bcc_address=(
                [config.from_server_email_address] +
                config.to_program_team_email_addresses
            ),
            subject=u"Welcome to {}!".format(program.name),
            template=template_path,
            template_data={'user_name': user.name},
        )
        email.put()

    def put(self, id=None):
        """If captain id is specified, and it's different than what's on
        reccord, then you must be the current captain or a super.
        """
        if id is None:
            # Somebody called PUT /api/<collection> which we don't support.
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD, POST'
            return

        user = self.get_current_user()
        team = Team.get_by_id(id)
        if not team:
            self.error(404)
            return

        params = self.get_params({'captain_id': str, 'organization_ids': list})

        captain_id = params.get('captain_id', None)
        captain_changing = captain_id and captain_id != team.captain_id
        allowed = not captain_changing or has_captain_permission(user, team)
        if not allowed:
            return self.http_forbidden(
                "Only the team captain may assign a new captain.")

        org_ids = params.get('organization_ids', None)
        orgs_changing = org_ids and set(org_ids) != set(team.organization_ids)
        allowed = not orgs_changing or has_captain_permission(user, team)
        if not allowed:
            return self.http_forbidden(
                "Only the team captain may add or remove organizations.")

        try:
            return super(Teams, self).put(id)
        except JsonTextValueLengthError:
            return self.http_payload_too_large("Value too long.")
        except JsonTextDictLengthError:
            return self.http_payload_too_large("Team data has too many keys.")

    def delete(self, id=None):
        """Change default rules so only captains can delete teams."""
        if id is None:
            # Somebody called DELETE /api/<collection> which we don't support.
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD, POST'
            return

        user = self.get_current_user()
        team = Team.get_by_id(id)
        if not team:
            self.error(404)
            return

        if not has_captain_permission(user, team):
            self.error(403)
            self.write("Only the team captain may delete the team.")
            return

        super(Teams, self).delete(id)

        # Also delete contained classrooms, and their contained reports.
        survey = Survey.get(team_id=team.uid)[0]
        classrooms = Classroom.get(team_id=team.uid)
        reports = [r for c in classrooms
                   for r in Report.get(classroom_id=c.uid)]
        Survey.delete_multi([survey])
        Classroom.delete_multi(classrooms)
        Report.delete_multi(reports)

        # Remove team association from all team members.
        users = User.query_by_team(team.uid)
        for u in users:
            if team.uid in u.owned_teams:
                u.owned_teams.remove(team.uid)
        User.put_multi(users)

        # Add special payload that will allow the client to also delete the
        # corresponding code on Neptune.
        payload = jwt_helper.get_payload(self.get_current_user())
        payload['allowed_endpoints'] = [
            self.get_endpoint_str(
                'DELETE',
                'neptune',
                '/api/codes/{}'.format(c.url_code),
            )
            for c in classrooms
        ]
        self.set_jwt(jwt_helper.encode(payload))


class UsersTeams(ApiHandler):
    requires_auth = True

    def get(self, user_id):
        user = self.get_current_user()

        program_label = self.request.GET.pop('program', None)
        if program_label:
            program = Program.get_by_label(program_label)
            if not program:
                self.write([])
                return
            program_id = program.uid
        else:
            program_id = None

        if not owns(user, user_id):
            return self.http_forbidden("Can't list teams for someone else.")

        self.write(Team.query_by_user(user, program_id=program_id))

    def post(self, *args, **kwargs):
        self.not_allowed()

    def put(self, *args, **kwargs):
        self.not_allowed()

    def delete(self, *args, **kwargs):
        self.not_allowed()

    def not_allowed(self):
        return self.http_method_not_allowed('GET, HEAD')


class OrganizationsTeams(ApiHandler):
    requires_auth = True

    def get(self, org_id):
        org_id = self.get_long_uid('organizations', org_id)

        if not owns(self.get_current_user(), org_id):
            return self.http_forbidden()

        self.write(Team.query_by_organization(org_id))

    def post(self, *args, **kwargs):
        self.not_allowed()

    def put(self, *args, **kwargs):
        self.not_allowed()

    def delete(self, *args, **kwargs):
        self.not_allowed()

    def not_allowed(self):
        return self.http_method_not_allowed('GET, HEAD')


class OrganizationsUsers(RestHandler):
    model = User
    requires_auth = True

    def get(self, org_id, user_id=None):
        user = self.get_current_user()
        org = Organization.get_by_id(org_id)

        if not org:
            return self.http_not_found()

        if not owns(user, org):
            return self.http_forbidden("You're not a member of that organization.")

        if user_id is None:
            results = User.query_by_organization(org_id)
        else:
            # Okay to just get the requested user, since we've verified the
            # requester owns the organization. This is not allowed in general, e.g.
            # via GET /api/users/X.
            results = User.get_by_id(user_id)
            if not results:
                return self.http_not_found()

        self.write(results)

    def post(self, *args, **kwargs):
        self.not_allowed()

    def put(self, *args, **kwargs):
        self.not_allowed()

    def delete(self, *args, **kwargs):
        self.not_allowed()

    def not_allowed(self):
        self.error(405)
        self.response.headers['Allow'] = 'GET, HEAD'


class Classrooms(RestHandler):
    model = Classroom
    requires_auth = True

    def post(self):
        """Team owners can create classrooms.

        Same as RestHandler.post, but modifies permission check and adds
        default contact id.
        """
        user = self.get_current_user()
        params = self.get_params(self.model.property_types())

        if 'team_id' not in params:
            return self.http_bad_request("Must provide team_id.")

        if not owns(user, params['team_id']):
            return self.http_forbidden("Must own related team.")

        contact_id = params.get('contact_id', None)
        team = Team.get_by_id(params['team_id'])
        if not contact_id:
            return self.http_bad_request("Must provide contact_id.")
        if contact_id != user.uid and not has_captain_permission(user, team):
            return self.http_bad_request(
                "Must be captain to specify someone else as contact.")

        new_entity = self.model.create(**params)
        new_entity.put()

        self.write(new_entity)
        return new_entity

    def put(self, id=None):
        """Don't let just anyone make themselves contact for a classroom."""
        if id is None:
            # Somebody called PUT /api/<collection> which we don't support.
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD, POST'
            return

        user = self.get_current_user()
        classroom = Classroom.get_by_id(id)
        if classroom is None:
            self.error(404)
            return
        team = Team.get_by_id(classroom.team_id)
        program = Program.get_by_id(team.program_id)

        allowed = (has_contact_permission(user, classroom) or
                   has_captain_permission(user, team))
        if not allowed:
            return self.http_forbidden(
                "Must be team captain or classroom main contact.")

        # Disallow moving classroom between teams
        new_team_id = self.get_param('team_id', str, '')
        if new_team_id != classroom.team_id:
            return self.http_forbidden(
                "Classrooms cannot be moved between teams."
            )

        super(Classrooms, self).put(id, override_permissions=allowed)
        self.notify(program, team, classroom)

    def notify(self, program, team, classroom):
        """Let people know if they're not the main contact anymore."""
        params = self.get_params({'contact_id': str})
        if params.get('contact_id', '') != classroom.contact_id:
            changer = self.get_current_user()
            old_contact = User.get_by_id(classroom.contact_id)
            program = Program.get_by_id(team.program_id)
            Notification.create(
                user_id=old_contact.uid,
                type='main-contact',
                template_params={
                    'changing_user_name': changer.name or changer.email,
                    'classroom_name': classroom.name,
                    'classroom_term': program.classroom_term,
                    'contact_term': program.contact_term,
                    'first_name': old_contact.first_name,
                    'program_name': program.name,
                },
            ).put()

    def delete(self, id=None):
        # Beyond ownership, must be the team captain or main contact.

        if id is None:
            # collection has no DELETE
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD, POST'
            return

        classroom = Classroom.get_by_id(id)
        if not classroom:
            self.error(404)
            return

        user = self.get_current_user()
        team = Team.get_by_id(classroom.team_id)

        allowed = (has_contact_permission(user, classroom) or
                   has_captain_permission(user, team))
        if not allowed:
            self.error(403)
            self.write("Must be team captain or classroom main contact.")
            return

        # Use default behavior to delete classroom.
        super(Classrooms, self).delete(id)

        # Disassociate any participants. Don't delete them so their
        # uid/student_id combinations (which are synced with Neptune) aren't
        # lost.
        ppts = Participant.get_for_classroom(team.uid, classroom.uid)
        for ppt in ppts:
            if classroom.uid in ppt.classroom_ids:
                ppt.classroom_ids.remove(classroom.uid)
        Participant.put_multi(ppts)

        # Additionally delete related reports.
        Report.delete_multi(Report.get(classroom_id=classroom.uid))

        # Add special payload that will allow the client to also delete the
        # corresponding code on Neptune.
        payload = jwt_helper.get_payload(user)
        payload['allowed_endpoints'] = [
            self.get_endpoint_str(
                'DELETE',
                'neptune',
                '/api/codes/{}'.format(classroom.code.replace(' ', '-'))
            )
        ]
        self.set_jwt(jwt_helper.encode(payload))


class CheckRoster(RestHandler):
    def get(self, code=None, student_id=None):
        # Public endpoint for verifying that the student_id appears in the roster
        # of the classroom associated with the provided code.

        code = code.replace('-', ' ')
        classroom = Classroom.get_by_code(code)

        if not classroom:
            return self.http_not_found()

        team = Team.get_by_id(classroom.team_id)
        program = Program.get_by_id(team.program_id)

        if program.use_classrooms:
            results = Participant.get_for_classroom(
                classroom.team_id,
                classroom.uid,
                [student_id],  # get_for_classroom() will strip
            )
        else:
            # Some programs don't use rosters/classrooms, so tell Neptune that
            # any arbitrary student id is "on the roster".
            results = [
                Participant.create(student_id=student_id, team_id=team.uid)
            ]

        if len(results) == 0:
            return self.http_not_found()

        ppt = results[0]  # N.B. only one student id queried
        response = {"uid": ppt.uid, "team_id": ppt.team_id}

        # If there's an active cycle, add some information about it so
        # Neptune can record data differently for different cycles.
        cycle = Cycle.get_current_for_team(classroom.team_id)
        cycle_keys = (
          'uid',
          'team_id',
          'ordinal',
          'start_date',
          'end_date',
        )
        if cycle:
            cycle_dict = cycle.to_client_dict()
            response.update(cycle={k: cycle_dict[k] for k in cycle_keys})
        return self.write(response)


class TeamsClassrooms(RelatedQuery(Classroom, 'team_id')):
    # RelatedQuery does all the work, using inherited handlers.
    pass


class Surveys(RestHandler):
    model = Survey
    requires_auth = True

    def put(self, id=None):
        if not Survey.config_enabled(id):
            return self.http_forbidden(
                "Survey config disabled for this program.")

        # Filter out any params which aren't safe.
        safe_props = (
            'meta',
            'metrics',
            'open_responses',
            'portal_message',
            'interval'
        )
        params = self.get_params(self.model.property_types())
        safe_params = {k: v for k, v in params.items() if k in safe_props}

        # Change the request to only have the safe params.
        self.override_json_body(safe_params)

        survey = super(Surveys, self).put(id)

        if not survey:
            # super will have set any necessary error status
            return

        # Add special payload that will allow the client to also delete the
        # corresponding code on Neptune.
        classrooms = Classroom.get(team_id=survey.team_id)
        payload = jwt_helper.get_payload(self.get_current_user())
        payload['allowed_endpoints'] = [
            self.get_endpoint_str(
                'PUT',
                'neptune',
                '/api/codes/{}'.format(c.url_code),
            )
            for c in classrooms
        ]
        self.set_jwt(jwt_helper.encode(payload))

    def post(self):
        self.not_allowed()

    def delete(self, id=None):
        self.not_allowed()

    def not_allowed(self):
        self.error(405)
        self.response.headers['Allow'] = 'GET, HEAD, PUT'


# Singular, since there's only ever one survey for a team.
class TeamsSurvey(RelatedQuery(Survey, 'team_id')):
    def get(self, *args, **kwargs):
        # Do the normal thing, which gets the data and writes to the response.
        results = super(TeamsSurvey, self).get(*args, **kwargs)

        if self.response.has_error():
            # the super call already set an error status; do nothing.
            return

        if len(results) != 1:
            # This means there's a serious problem. Tell the devs.
            logging.error("Couldn't find survey for valid team.")
            return self.http_not_found()

        # Replace the normal list response with just the first result.
        single_result = results[0]
        self.response.body = ''
        self.write(single_result)


class Metrics(RestHandler):
    model = Metric
    requires_auth = True

    def get(self, *args, **kwargs):
        """Anyone can list metrics."""
        super(Metrics, self).query(override_permissions=True)


class Digests(RestHandler):
    model = Digest
    requires_auth = True


class SecretValues(ApiHandler):
    """For securely storing secret values."""
    # POSTs will contain secret values. Don't log them.
    should_log_request = False

    def get(self, id):
        if not app_engine_users.is_current_user_admin():
            return self.http_forbidden()
        exists = SecretValue.get_by_id(id) is not None
        self.write({'key exists': exists,
                    'message': "SecretValues can't be read via api urls."})

    def post(self, id):
        if not app_engine_users.is_current_user_admin():
            return self.http_forbidden()
        value = self.get_param('value', unicode, None)
        if value is None:
            return self.http_bad_request("Must POST with a value.")
        sv = SecretValue.get_or_insert(id)
        sv.value = value
        sv.put()
        self.write(id)

    def delete(self, id):
        if not app_engine_users.is_current_user_admin():
            return self.http_forbidden()
        sv = SecretValue.get_by_id(id)
        if sv is not None:
            sv.key.delete()
        self.write(id)


class Cycles(RestHandler):
    model = Cycle
    requires_auth = True

    def post(self, id=None):
        if id:
            return self.http_method_not_allowed('GET, HEAD')

        params = self.get_params(self.model.property_types())
        if 'team_id' not in params:
            return self.http_bad_request("Cycles must have a team_id.")

        user = self.get_current_user()
        team = Team.get_by_id(params['team_id'])

        if not has_captain_permission(user, team):
            return self.http_forbidden("Must be captain to save cycles.")

        new_cycle = Cycle.create(**params)
        existing = Cycle.get(team_id=team.uid)

        try:
            team_cycles = Cycle.reorder_and_extend(existing + [new_cycle])
        except Exception as e:
            logging.info(e)
            return self.http_bad_request(str(e))

        Cycle.put_multi(team_cycles)

        self.write(new_cycle)

    def put(self, id=None):
        if id is None:
            return self.http_method_not_allowed('GET, HEAD, POST')

        mod_cycle = Cycle.get_by_id(id)
        if mod_cycle is None:
            return self.http_not_found()

        user = self.get_current_user()
        team = Team.get_by_id(mod_cycle.team_id)

        if not has_captain_permission(user, team):
            return self.http_forbidden("Only captains can update cyles.")

        params = self.get_params(self.model.property_types())
        for k, v in params.items():
            setattr(mod_cycle, k, v)
        # Replace the db version of this cycle with the modified version so
        # we can order it and check it against the others.
        existing_cycles = [c for c in Cycle.get(team_id=team.uid)
                           if c != mod_cycle]
        updated_cycles = existing_cycles + [mod_cycle]

        try:
            cycles_to_put = Cycle.reorder_and_extend(updated_cycles)
        except Exception as e:
            logging.info(e)
            return self.http_bad_request(str(e))

        Cycle.put_multi(cycles_to_put)

        # Depending on exactly how the cycle being PUT has changed, our
        # reference to it may be out of sync with the db. We want the modified
        # time to match the envelope, so re-fetch.
        if mod_cycle.uid in [c.uid for c in cycles_to_put]:
            mod_cycle = Cycle.get_by_id(mod_cycle.uid)

        self.write(mod_cycle)

    def delete(self, id=None):
        if id is None:
            return self.http_method_not_allowed('GET, HEAD, POST')

        cycle = Cycle.get_by_id(id)
        if cycle is None:
            return self.http_not_found()

        user = self.get_current_user()
        team = Team.get_by_id(cycle.team_id)

        if not has_captain_permission(user, team):
            return self.http_forbidden("Only captains can delete cyles.")

        if team.program_id:
            program = Program.get_by_id(team.program_id)
            if program.min_cycles is not None:
                num_cycles = Cycle.count(team_id=team.uid)
                if num_cycles <= program.min_cycles:
                    return self.http_forbidden(
                        "Team already has minimum number of cycles allowed "
                        "by program."
                    )

        super(Cycles, self).delete(id=id)

        if not self.response.has_error():
            # This should be unproblematic b/c deleting a cycle should never
            # cause an overlap.
            team_cycles = Cycle.get(team_id=team.uid)
            Cycle.put_multi(Cycle.reorder_and_extend(team_cycles))

        # We need to pass cycle so the envelope can be calculated
        self.write(cycle)

    def get_envelope(self, data):
        if self.envelope == 'team_cycles':
            team_cycles = Cycle.get(team_id=data['team_id'], order='ordinal')
            self.response.status = 200
            return super(Cycles, self).get_envelope(
                data,
                team_cycles=self.convert_for_client(team_cycles),
            )
        else:
            return super(Cycles, self).get_envelope(data)


class TeamsCycles(RestHandler):
    model = Cycle
    requires_auth = True

    def get(self, parent_type, rel_id, current=None):
        user = self.get_current_user()
        team = Team.get_by_id(rel_id)

        if not team:
            return self.http_not_found()

        if not owns(user, team) and not has_captain_permission(user, team):
            return self.http_forbidden("Only team members can get cycles.")

        if current:
            return self.write(Cycle.get_current_for_team(team.uid))

        # Add the team id as if it was in the query string, then RestHandler
        # can do the rest.
        self.request.GET['team_id'] = team.uid
        if 'order' not in self.request.GET:
            self.request.GET['order'] = 'ordinal'
        return super(TeamsCycles, self).query(override_permissions=True)


class Participants(RestHandler):
    model = Participant
    requires_auth = True

    def get(self, id=None):
        override_permissions = False
        if id:
            # Special permission case: can read the participant if merely a
            # team member.
            ppnt = Participant.get_by_id(id)
            if not ppnt:
                return self.http_not_found()

            team = Team.get_by_id(ppnt.team_id)
            user = self.get_current_user()

            override_permissions = team.uid in user.owned_teams

        return super(Participants, self).get(
            id=id,
            override_permissions=override_permissions,
        )

    def post(self):
        return self.http_method_not_allowed('HEAD, GET, PATCH')

    def has_post_permission(self, classroom):
        # Contacts and captains may create participants.
        team = Team.get_by_id(classroom.team_id)
        user = self.get_current_user()

        return (has_contact_permission(user, classroom) or
                has_captain_permission(user, team))

    def put(self, id=None):
        ppt = super(Participants, self).put(id)

        if ppt:
            affected_classrooms = Classroom.get(team_id=ppt.team_id)
            for cl in affected_classrooms:
                cl.num_students = Participant.count_for_classroom(cl.uid)
            Classroom.put_multi(affected_classrooms)

    def patch(self, id=None):
        if id:
            return self.http_method_not_allowed('HEAD, GET, PUT')

        patch_body = self.process_json_body()
        post_bodies = [req['body'] for req in patch_body]

        if len(patch_body) == 0:
            self.write([])
            return

        if not all(req['method'] == 'POST' for req in patch_body):
            return self.http_bad_request("Only POST requests allowed.")

        if not all(req['path'] == self.request.path for req in patch_body):
            return self.http_bad_request("Only matching paths allowed.")

        all_cl_ids = set(b['classroom_id'] for b in post_bodies)
        if len(all_cl_ids) != 1:
            return self.http_bad_request("Can't mix classrooms.")

        classroom_id = all_cl_ids.pop()
        classroom = Classroom.get_by_id(classroom_id)
        allowed = self.has_post_permission(classroom)

        if not allowed:
            return self.http_forbidden('must be captain or main contact.')

        # Filter participant body properties by what's allowed in the model.
        param_dicts = [self.get_params(self.model.property_types(), source=b)
                       for b in post_bodies]
        # The classroom id is specified as a single value in the call, because
        # we want to enforce only one classroom per call. But we store it as
        # a list. So translate here.
        for d in param_dicts:
            d['classroom_ids'] = [classroom_id]
        # Create a participant out of each set of parameters.
        posted_ppts = [Participant.create(**params) for params in param_dicts]

        existing_ppts = Participant.get_for_team(
            classroom.team_id,
            student_ids=[p.student_id for p in posted_ppts],
        )
        # However they are stored in the database, compare them based on how
        # the portal will identify them, which is a stripped version.
        existing_ids = [p.stripped_student_id for p in existing_ppts]

        # These participants are brand new, and we should put them as-is.
        new_ppts = [p for p in posted_ppts
                    if p.stripped_student_id not in existing_ids]

        # Existing participants need their classroom_id updated.
        updated_ppts = []
        for ppt in existing_ppts:
            if classroom_id not in ppt.classroom_ids:
                ppt.classroom_ids.append(classroom_id)
                updated_ppts.append(ppt)

        # Insert them all at once.
        Participant.put_multi(new_ppts + updated_ppts)

        # Update num_students on classroom
        classroom.num_students = \
            Participant.count_for_classroom(classroom.uid)
        classroom.put()

        self.write(new_ppts + existing_ppts)

    def delete(self, id=None):
        if id:
            return self.http_method_not_allowed('HEAD, GET, PUT')
        return self.http_method_not_allowed('HEAD, GET, PATCH')


class Rosters(RestHandler):
    model = Participant
    requires_auth = True

    def get(self, parent_type, rel_id):
        user = self.get_current_user()
        if parent_type == 'classrooms':
            classroom = Classroom.get_by_id(rel_id)
            if not classroom:
                return self.http_not_found()
            if not owns(user, classroom):
                return self.http_forbidden("Must be on the team.")
            self.write(Participant.get_for_classroom(
                classroom.team_id, classroom.uid))
        if parent_type == 'teams':
            team = Team.get_by_id(rel_id)
            if not team:
                return self.http_not_found()
            if not owns(user, team):
                return self.http_forbidden("Must be on the team.")
            self.write(Participant.get_for_team(team.uid))


api_routes = [
    Route('/api/invitations', Invitations),
    Route('/api/version', Version),

    Route('/api/accounts/<email>', Accounts),

    Route('/api/users', Users),
    Route('/api/users/<id>', Users),
    Route('/api/programs', Programs),
    Route('/api/programs/<program_id_or_label>/search', ProgramsSearch),
    Route('/api/teams/<team_id>/users', TeamsUsers),
    Route('/api/teams/<team_id>/users/<user_id>', TeamsUsers),
    Route('/api/organizations/<org_id>/users', OrganizationsUsers),
    Route('/api/organizations/<org_id>/users/<user_id>',
          OrganizationsUsers),

    Route('/api/organizations', Organizations),
    Route('/api/organizations/<id>', Organizations),
    Route('/api/organizations/<id>/code', OrganizationCode),
    Route('/api/organizations/<id>/report_data', OrganizationReportData),
    Route('/api/users/<user_id>/organizations', UsersOrganizations),
    Route('/api/teams/<team_id>/organizations', TeamsOrganizations),
    Route('/api/organization_dashboards/<org_id>', OrganizationDashboards),

    Route('/api/networks', Networks),
    Route('/api/networks/<id>', Networks),
    Route('/api/networks/<id>/code', NetworkCode),
    Route('/api/users/<user_id>/networks', UsersNetworks),

    Route('/api/teams', Teams),
    Route('/api/teams/<id>', Teams),
    Route('/api/users/<user_id>/teams', UsersTeams),
    Route('/api/organizations/<org_id>/teams', OrganizationsTeams),

    Route('/api/classrooms', Classrooms),
    Route('/api/classrooms/<id>', Classrooms),
    Route('/api/<parent_type:teams>/<rel_id>/classrooms', TeamsClassrooms),

    Route('/api/codes/<code>/participants/<student_id>', CheckRoster),

    Route('/api/surveys', Surveys),
    Route('/api/surveys/<id>', Surveys),
    # singular!
    Route('/api/<parent_type:teams>/<rel_id>/survey', TeamsSurvey),

    Route('/api/reports', Reports),
    Route('/api/reports/<id>', Reports),
    Route('/api/<parent_type:(networks|organizations|teams)>/<rel_id>/reports',
          ParentReports),
    Route('/api/<parent_type:(organizations|teams|classrooms)>/<rel_id>/reports/<filename>',
          ReportPdf),

    Route('/api/metrics', Metrics),
    Route('/api/metrics/<id>', Metrics),

    Route('/api/cycles', Cycles),
    Route('/api/cycles/<id>', Cycles),
    Route('/api/<parent_type:teams>/<rel_id>/cycles', TeamsCycles),
    Route('/api/<parent_type:teams>/<rel_id>/cycles/<current:current>',
          TeamsCycles),
    Route('/api/<parent_type:teams>/<rel_id>/cycles/<id>', TeamsCycles),

    Route('/api/responses', Responses),
    Route('/api/responses/<id>', Responses),
    Route('/api/<parent_type:teams>/<rel_id>/responses', TeamsResponses),

    Route('/api/participants', Participants),
    Route('/api/participants/<id>', Participants),
    Route('/api/<parent_type:(teams|classrooms)>/<rel_id>/participants',
          Rosters),

    Route('/api/digests', Digests),
    Route('/api/digests/<id>', Digests),
    Route('/api/<parent_type:users>/<rel_id>/digests',
          RelatedQuery(Digest, 'user_id')),

    Route('/api/secret_values', SecretValues),
    Route('/api/secret_values/<id>', SecretValues),

    Route('/api/emails', Emails),

    Route('/api/mandrill_templates', MandrillTemplates),
    Route('/api/mandrill_templates/<slug>', MandrillTemplates),
]
