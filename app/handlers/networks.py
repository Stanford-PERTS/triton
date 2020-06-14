import logging
import os

import jwt_helper
from gae_handlers import ApiHandler, RestHandler
from model import (
    Network,
    Program,
    User,
)
from permission import has_captain_permission, has_contact_permission, owns


class Networks(RestHandler):
    model = Network
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
        super(Networks, self).query(
            override_permissions=override_permissions)

    def post(self):
        """Anyone can create network.

        Same as RestHandler.post, but removes permission check.
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

        # Create network.
        org = self.model.create(**params)
        org.put()

        # Associate with creating user.
        p = user.get_owner_property(org)
        if p is not None:
            p.append(org.uid)
            user.put()

        self.write(org)
        return org

    def put(self, id=None):
        """Don't let people change the network code with a PUT.

        Because we use a unique key on that field, and all our INSERTs have ON
        DUPLICATE KEY UPDATE, a PUT with a code that matched a different
        network would update that _other network_, which is fubar.
        """
        unsafe_props = ('code',)
        params = self.get_params(self.model.property_types())
        safe_params = {k: v for k, v in params.items() if k not in unsafe_props}

        # Change the request to only have the safe params.
        self.override_json_body(safe_params)

        return super(Networks, self).put(id)

    def delete(self, id=None):
        """Change default rules to disassociate teams."""
        super(Networks, self).delete(id)

        # Look up other networks owners, and remove their association.
        users = User.query_by_network(id)
        for user in users:
            if id in user.owned_networks:
                user.owned_networks.remove(id)
        User.put_multi(users)


class NetworkCode(ApiHandler):
    model = Network
    requires_auth = True

    def post(self, id):
        if not owns(self.get_current_user(), id):
            return self.http_forbidden("You don't own that network.")

        net = Network.get_by_id(id)
        if not net:
            return self.http_not_found()

        net.code = Network.generate_unique_code()
        net.put()

        self.write(net)


class UsersNetworks(ApiHandler):
    model = Network
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
            return self.http_forbidden("Can't list networks for someone else.")

        self.write(Network.query_by_user(user, program_id=program_id))
