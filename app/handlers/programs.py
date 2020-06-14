import logging

from gae_handlers import RestHandler
from model import Program
from permission import owns


class Programs(RestHandler):
    model = Program
    requires_auth = True

    def get(self):
        self.write(Program.get(active=True, order='name'))

    def post(self):
        self.not_allowed()

    def put(self):
        self.not_allowed()

    def delete(self, id=None):
        self.not_allowed()

    def not_allowed(self):
        self.error(405)
        self.response.headers['Allow'] = 'GET, HEAD'
