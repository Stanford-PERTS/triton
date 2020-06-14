"""Test creation and rendering of notifications."""

import datetime
import logging

from model import Digest, Notification, User
from unit_test_helper import ConsistencyTestCase
import mysql_connection
import util


class TestNotifications(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestNotifications, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'digest': Digest.get_table_definition(),
                'notification': Notification.get_table_definition(),
                'user': User.get_table_definition(),
            })

    def test_create(self, user=None, note_type='generic',
                    template_params={}):
        params = {
            'url': 'http://www.example.com',
            'message': "Single item goes here.",
            'first_name': "Henry",
            'program_name': "Foo Program",
        }
        params.update(**template_params)
        n = Notification.create(
            user_id=user.uid if user else 'User_foo',
            type=note_type,
            template_params=params,
        )
        return n

    def test_get(self):
        n = self.test_create()
        n.put()
        self.assertEqual(n, Notification.get_by_id(n.uid))
        return n

    def test_get_day(self):
        """Get all user's notifications for the last 24 hours."""
        user = User.create(name='superdude', email='super@dude.com')

        old = self.test_create(user=user)
        old.created = datetime.datetime(2017, 1, 1)
        # Simulate a put, but without stripping timestamps at this step, which
        # SqlModel.put() would normally do. This lets us post-date the
        # notification.
        row_dict = Notification.coerce_row_dict(old.to_dict())
        with mysql_connection.connect() as sql:
            sql.insert_or_update(Notification.table, row_dict)

        # This one gets CURRENT_TIMESTAMP, as normal.
        new = self.test_create(user=user)
        new.put()

        # Only the new one should be returned.
        start = datetime.datetime.now() - datetime.timedelta(hours=12)
        end = datetime.datetime.now() + datetime.timedelta(hours=12)
        notes = Notification.get_period_for_user(
            user,
            util.datelike_to_iso_string(start),
            util.datelike_to_iso_string(end),
        )
        self.assertEquals(len(notes), 1)

    def test_notification_render(self):
        n = self.test_create()
        self.assertIn(n.template_params['url'], n.render())

    def test_digest_main_contact(self):
        name1 = 'Class Foo'
        name2 = 'Class Bar'
        extra_params = {
            'changing_user_name': "Mr. Changer",
            'contact_term': "Main Contact",
            'classroom_term': "Classroom",
        }
        n1 = self.test_create(
            note_type='main-contact',
            template_params=dict(
                extra_params,
                first_name="Digory",
                classroom_name=name1,
            ),
        )
        n2 = self.test_create(
            note_type='main-contact',
            template_params=dict(extra_params, classroom_name=name2),
        )

        digest = Digest.create([n1, n2])

        # Having the first name param in the first notification is sufficient
        # to include it in the digest body.
        self.assertIn("Digory", digest.body)
        # Params that are interpolated into individual items should all appear.
        self.assertIn(name1, digest.body)
        self.assertIn(name2, digest.body)

    def test_digest_report(self):
        url1 = 'a.com'
        url2 = 'b.com'
        extra_params = {'context_name': "Team Foo"}
        n1 = self.test_create(
            note_type='report',
            template_params=dict(extra_params, first_name="Digory", url=url1),
        )
        n2 = self.test_create(
            note_type='report',
            template_params=dict(extra_params, url=url2),
        )

        digest = Digest.create([n1, n2])

        # Having the first name param in the first notification is sufficient
        # to include it in the digest body.
        self.assertIn("Digory", digest.body)
        # Params that are interpolated into individual items should all appear.
        self.assertIn(url1, digest.body)
        self.assertIn(url2, digest.body)

    def test_digest_escaping(self):
        user = User.create(email='demo@perts.net', name="Cedric Digory")
        params = {
            'context_name': "Evil < Team",
            'first_name': "Evil < Cedric",
            'url': 'https://example.com',
        }
        n1 = self.test_create(
            note_type='report',
            user=user,
            template_params=params,
        )
        n2 = self.test_create(
            note_type='report',
            user=user,
            template_params=params,
        )
        n1.put()
        n2.put()

        start = util.datelike_to_iso_string(
            datetime.datetime.now() - datetime.timedelta(days=1))
        end = util.datelike_to_iso_string(
            datetime.datetime.now() + datetime.timedelta(days=1))
        digests, emails, smss = Digest.process_user(user, start, end)

        self.assertEqual(len(digests), 1)  # just the 'report' type

        # Items are inserted with angle brackets NOT escaped.
        self.assertIn('<a href="https://example.com">', digests[0].body)

        # User-provided text IS escaped
        self.assertIn('Evil &lt; Team', digests[0].body)
        self.assertIn('Evil &lt; Cedric', digests[0].body)

    def create_many(self):
        # There should be four digests: two users by two digest types.
        user1 = User.create(name='User One', email='one@perts.net')
        user2 = User.create(name='User Two', email='two@perts.net')
        User.put_multi([user1, user2])
        report_params = {'context_name': 'Geography', 'program_name': 'Foo'}
        notes = [
            self.test_create(user=user1, note_type='generic'),
            self.test_create(user=user1, note_type='generic'),
            self.test_create(user=user1, note_type='report',
                             template_params=report_params),
            self.test_create(user=user1, note_type='report',
                             template_params=report_params),
            self.test_create(user=user2, note_type='generic'),
            self.test_create(user=user2, note_type='generic'),
            self.test_create(user=user2, note_type='report',
                             template_params=report_params),
            self.test_create(user=user2, note_type='report',
                             template_params=report_params),
        ]
        Notification.put_multi(notes)
        return user1, user2, notes

    def test_digest_user(self):
        # This is the same thing that /task/digest_user_notifications does.
        user1, user2, notes = self.create_many()
        start = datetime.datetime.now() - datetime.timedelta(hours=12)
        end = datetime.datetime.now() + datetime.timedelta(hours=12)
        digests, emails, smss = Digest.process_user(
            user1,
            util.datelike_to_iso_string(start),
            util.datelike_to_iso_string(end),
        )
        self.assertEqual(len(digests), 2)
        self.assertEqual(len(emails), 2)
        # @todo: once sms is built, test this
        # self.assertEqual(len(smss), 2)
        for d in digests:
            # They are strings of some length
            self.assertGreater(len(d.body), 0)

        # @todo assert something about the contents of the email?

    def test_preferences(self):
        """Users can opt out of emails and sms."""
        user1, user2, notes = self.create_many()
        user1.receive_email = False
        user1.receive_sms = False
        user1.put()
        start = datetime.datetime.now() - datetime.timedelta(hours=12)
        end = datetime.datetime.now() + datetime.timedelta(hours=12)
        digests, emails, smss = Digest.process_user(
            user1,
            util.datelike_to_iso_string(start),
            util.datelike_to_iso_string(end),
        )
        self.assertEqual(len(digests), 2)
        self.assertEqual(len(emails), 0)
        self.assertEqual(len(smss), 0)

    def test_users_with_notifications(self):
        user1, user2, notes = self.create_many()
        start = datetime.datetime.now() - datetime.timedelta(hours=12)
        end = datetime.datetime.now() + datetime.timedelta(hours=12)
        user_ids = Notification.users_with_notifications(
            util.datelike_to_iso_string(start),
            util.datelike_to_iso_string(end),
        )
        self.assertEqual({user1.uid, user2.uid}, set(user_ids))
