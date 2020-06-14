"""Tests endpoint /api/metrics.

Indirectly tests RelatedQuery with SqlModel. Other suites may skip handlers
naively inherit from the same code.
"""

import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Metric, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiMetrics(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiMetrics, self).set_up()

        application = webapp2.WSGIApplication(
            api_routes,
            config={
                'webapp2_extras.sessions': {
                    'secret_key': self.cookie_key
                }
            },
            debug=True
        )
        self.testapp = webtest.TestApp(application)

        with mysql_connection.connect() as sql:
            sql.reset({
                'metric': Metric.get_table_definition(),
                'user': User.get_table_definition(),
            })

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def create_metrics(self):
        other = User.create(name='other', email='other@bar.com')
        other.put()
        metric1 = Metric.create(name="Community of Helpers",
                                label='community_of_helpers')
        metric1.put()
        metric2 = Metric.create(name="Feedback for Growth",
                                label='feedback_for_growth')
        metric2.put()

        return (other, metric1, metric2)

    def test_get_all_requires_auth(self):
        self.testapp.get('/api/metrics', status=401)

    def test_get_all_unrelated_allowed(self):
        """Any authed user, regardless of relationship, may list metrics."""
        other, metric1, metric2 = self.create_metrics()
        response = self.testapp.get(
            '/api/metrics',
            headers=self.login_headers(other),
        )
        self.assertEqual(len(json.loads(response.body)), 2)

