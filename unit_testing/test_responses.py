"""Test responses."""

from google.appengine.ext import testbed
import json
import logging
import MySQLdb
import unittest
import webapp2
import webtest

from model import Response, ResponseBackup, User
from unit_test_helper import ConsistencyTestCase
from task_handlers import task_routes
import mysql_connection
import util


class TestResponses(ConsistencyTestCase):
    response_params = {
        'type': None,
        'private': None,
        'user_id': '',
        'team_id': 'Team_foo',
        'parent_id': 'Cycle_foo',
        'module_label': 'DemoModule',
        'progress': 50,
        'page': 1,
        'body': {
            'question1': {
                'modified': '2019-01-01T00:00:00Z',
                'value': 'foo',
            },
        },
    }

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestResponses, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'response': Response.get_table_definition(),
                'response_backup': ResponseBackup.get_table_definition(),
                'user': User.get_table_definition(),
            })

        application = webapp2.WSGIApplication(task_routes)
        self.testapp = webtest.TestApp(application)

        self.taskqueue_stub = self.testbed.get_stub(
            testbed.TASKQUEUE_SERVICE_NAME)

    def test_insert_creates_task(self):
        # **Don't** use .put() here, because responses are saved with a
        # custom transaction via insert_or_conflict() and update_or_conflict().

        # Initial save should create a task.
        user_response_params = dict(
            self.response_params,
            type=Response.USER_LEVEL_SYMBOL,
            private=True,
            user_id='User_foo',
        )
        r = Response.insert_or_conflict(user_response_params)
        expected_payload = json.dumps(
            r.to_dict(),
            default=util.json_dumps_default,
        )
        tasks = self.taskqueue_stub.get_filtered_tasks()
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0].payload, expected_payload)

    def test_update_creates_task(self):
        # **Don't** use .put() here, because responses are saved with a
        # custom transaction via insert_or_conflict() and update_or_conflict().

        user_response_params = dict(
            self.response_params,
            type=Response.USER_LEVEL_SYMBOL,
            private=True,
            user_id='User_foo',
        )
        r = Response.create(**user_response_params)
        r.put() # Creates one task.

        # Modifying should create a (second) task.
        new_params = dict(user_response_params, progress = 100)
        updated = Response.update_or_conflict(r.uid, new_params, False)
        expected_payload = json.dumps(
            updated.to_dict(),
            default=util.json_dumps_default,
        )
        tasks = self.taskqueue_stub.get_filtered_tasks()
        self.assertEqual(len(tasks), 2)
        self.assertEqual(tasks[1].payload, expected_payload)

    def test_atomic_updates(self):
        """Not exactly a test; more of a proof of concept that mysql
        row locking works."""
        r = Response.create(
            user_id='User_foo',
            team_id='Team_foo',
            parent_id='Cycle_foo',
            module_label='ModuleFoo',
            body={'foo': 'bar'},
            progress=0,
        )
        r.put()

        table = 'response'

        with mysql_connection.connect(retry_on_error=False) as sql:
            # This simulates one user clicking "submit" to a module.
            sql.select_row_for_update(table, 'uid', r.uid)  # locks

            with self.assertRaises(MySQLdb.OperationalError):
                with mysql_connection.connect(retry_on_error=False) as sql:
                    # This default to 50, which is too long to wait.
                    sql.query('SET innodb_lock_wait_timeout = 1', tuple())

                    # This simulates another user clicking submit on their
                    # client at the exact same time, which if it weren't for the
                    # lock would be a race condition. Here it should just wait,
                    # and then reach the timeout and raise.
                    sql.update_row(table, 'uid', r.uid, progress=1)

                    # Unfortunately exiting here will close _both_ connections,
                    # so we'll have to let that happen and open a third.

        # If lock succeeded, the data should be unchanged.
        fetched = Response.get_by_id(r.uid)
        self.assertEqual(fetched.progress, 0)

    def test_task_creates_backup_for_user(self):
        user_response_params = dict(
            self.response_params,
            type=Response.USER_LEVEL_SYMBOL,
            private=True,
            user_id='User_foo',
        )
        r = Response.create(**user_response_params)
        r.put()
        payload = json.dumps(
            r.to_dict(),
            default=util.json_dumps_default,
        )

        self.testapp.post(
            '/task/backup_response',
            payload,
            headers={'Content-Type': 'application/json'},
        )

        with mysql_connection.connect() as sql:
            rows = sql.select_star_where(ResponseBackup.table)

        backup = rows[0]
        backup['body'] = json.loads(backup['body'])
        expected = dict(r.to_dict(), backup_id=1),
        self.assertEqual(len(rows), 1)
        self.assertEqual(
            rows[0],
            dict(r.to_dict(), backup_id=1),
        )

    def test_redaction_public_team_level(self):
        user = User.create(email='foo@bar.com')
        team_params = dict(
            self.response_params,
            type=Response.TEAM_LEVEL_SYMBOL,
            private=False,
        )
        r = Response.create(**team_params)
        r.put()

        responses = Response.get_for_teams(user, [team_params['team_id']])

        # Not redacted.
        self.assertGreater(len(responses[0].body), 0)

    def test_redaction_public_user_level(self):
        user = User.create(email='foo@bar.com')
        user_params = dict(
            self.response_params,
            type=Response.USER_LEVEL_SYMBOL,
            private=False,
            user_id='User_foo',
        )
        r = Response.create(**user_params)
        r.put()

        responses = Response.get_for_teams(user, [user_params['team_id']])

        # Not redacted, even though user doesn't own the response.
        self.assertGreater(len(responses[0].body), 0)

    def test_redaction_private_user_level(self):
        team_id = self.response_params['team_id']
        user = User.create(email='foo@bar.com')

        own_params = dict(
            self.response_params,
            type=Response.USER_LEVEL_SYMBOL,
            private=True,
            user_id=user.uid,
        )
        own_private_response = Response.create(**own_params)
        own_private_response.put()

        other_params = dict(
            self.response_params,
            type=Response.USER_LEVEL_SYMBOL,
            private=True,
            user_id='User_other',
        )
        other_private_response = Response.create(**other_params)
        other_private_response.put()

        responses = Response.get_for_teams(user, [team_id])

        self.assertEqual(len(responses), 2)
        own_fetched = next(r for r in responses if r.user_id == user.uid)
        other_fetched = next(r for r in responses if r.user_id != user.uid)

        # Own response is not redacted, despite being private.
        self.assertGreater(len(own_fetched.body), 0)

        # Other's private response is redacted.
        self.assertEqual(len(other_fetched.body), 0)
