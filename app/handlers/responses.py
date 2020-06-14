from gae_handlers import RestHandler
from model import (
  JsonTextValueLengthError,
  JsonTextDictLengthError,
  Response,
  ResponseBodyKeyConflict,
  ResponseIndexConflict,
  ResponseNotFound,
  SqlModel,
  Team,
)
from permission import has_captain_permission, owns


class Responses(RestHandler):
    model = Response
    requires_auth = True

    def post(self):
        # Anyone is allowed to post responses.
        params = self.get_params(Response.property_types())
        user = self.get_current_user()

        if 'user_id' not in params:
            params['user_id'] = user.uid

        required_params = ('team_id', 'parent_id', 'module_label')
        for k in required_params:
            if not params.get(k, None):
                return self.http_bad_request("{} required.".format(k))

        # Validate the parent, if it's a cycle.
        parent_id = params.get('parent_id', None)
        parent_kind = SqlModel.get_kind(parent_id)
        if parent_kind == 'Cycle':
            cycle = SqlModel.kind_to_class(parent_kind).get_by_id(parent_id)
            if not cycle or not owns(user, parent_id):
                return self.http_forbidden("Must own the parent to respond.")
        # ...else this is a step label, so allow any truthy string.

        # Permission to create varies by type/level.
        params['type'] = params.get('type', Response.USER_LEVEL_SYMBOL)
        if params['type'] == Response.TEAM_LEVEL_SYMBOL:
            if not owns(user, params['team_id']):
                return self.http_forbidden("Must own the team to respond.")
        elif not owns(user, params['user_id']):
            return self.http_forbidden("May not create responses for others.")

        try:
            new_entity = Response.insert_or_conflict(params)
        except ResponseIndexConflict:
            return self.http_conflict(
                "Response for this type-user-team-parent-module combination "
                "exists. Send a request like `PUT /api/responses/:id`."
            )
        except JsonTextValueLengthError:
            return self.http_payload_too_large("Value too long.")
        except JsonTextDictLengthError:
            return self.http_payload_too_large("Body has too many keys.")
        self.write(new_entity)

    def put(self, id=None):
        if id is None:
            # Somebody called PUT /api/<collection> which we don't support.
            return self.http_method_not_allowed('GET, HEAD, POST')

        id = self.model.get_long_uid(id)

        if not owns(self.get_current_user(), id):
            return self.http_forbidden()

        force = self.request.get('force', None) == 'true'  # from query str
        params = self.get_params(self.model.property_types())  # json body

        # Don't allow any changes to response privacy.
        params.pop('private', None)

        try:
            entity = Response.update_or_conflict(id, params, force)
        except ResponseNotFound:
            return self.http_not_found()
        except JsonTextValueLengthError:
            return self.http_payload_too_large("Value too long.")
        except JsonTextDictLengthError:
            return self.http_payload_too_large("Body has too many keys.")
        except ResponseBodyKeyConflict as e:
            return self.http_conflict({
                'message': (
                    "Keys conflict: {}. Repeat with ?force=true to override."
                    .format(', '.join(e.args[0]))
                ),
                'keys': e.args[0],
            })

        self.write(entity)


class TeamsResponses(RestHandler):
    model = Response
    requires_auth = True

    def get(self, parent_type, rel_id):
        user = self.get_current_user()
        team = Team.get_by_id(rel_id)

        if not team:
            return self.http_not_found()

        if not owns(user, team) and not has_captain_permission(user, team):
            return self.http_forbidden("Only team members can get responses.")

        parent_id = self.get_param('parent_id', str, None)

        # We return empty dictionaries for the `body` property of some
        # responses (private responses belonging to other users).
        responses = Response.get_for_teams(user, [team.uid], parent_id)

        self.write(responses)
