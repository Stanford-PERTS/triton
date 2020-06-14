from gae_handlers import RestHandler
from model import Email

class Emails(RestHandler):
    requires_auth = True

    model = Email

    def get(self, **kwargs):
        self.not_allowed()

    def put(self):
        self.not_allowed()

    def delete(self):
        self.not_allowed()

    def not_allowed(self):
        return self.http_not_allowed('POST')
