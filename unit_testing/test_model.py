"""Test generic model operations."""

import datetime
import logging

from model import User
from unit_test_helper import ConsistencyTestCase
import config
import mysql_connection
import util


def str_to_dt(s):
    return datetime.datetime.strptime(s, config.iso_datetime_format)


class TestModel(ConsistencyTestCase):

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestModel, self).set_up()

        with mysql_connection.connect() as sql:
            sql.reset({
                'user': User.get_table_definition(),
            })

    def test_get_one_by_id(self):
        user1 = User.create(email="user1@perts.net")
        user1.put()

        fetched = User.get_by_id(user1.uid)
        self.assertEqual(user1, fetched)

    def test_get_none_by_id(self):
        self.assertEqual(User.get_by_id(None), None)

    def test_get_multi_by_id(self):
        user1 = User.create(email="user1@perts.net")
        user2 = User.create(email="user2@perts.net")
        user1.put()
        user2.put()

        fetched = User.get_by_id([user1.uid, user2.uid])
        self.assertEqual(set(fetched), {user1, user2})

    def test_get_empty_by_id(self):
        self.assertEqual(User.get_by_id([]), [])

    def test_delete_multi(self):
        user1 = User.create(email="user1@perts.net")
        user2 = User.create(email="user2@perts.net")
        user1.put()
        user2.put()

        User.delete_multi([user1, user2])
        self.assertIsNone(User.get_by_id(user1.uid))
        self.assertIsNone(User.get_by_id(user2.uid))

    def test_delete_empty(self):
        User.delete_multi([])

    def test_get_limit(self):
        users = [User.create(email=x) for x in range(102)]
        User.put_multi(users)

        # There's a default limit of 100.
        default_fetch = User.get()
        self.assertEqual(len(default_fetch), 100)

        # Should be able to change the limit.
        default_fetch = User.get(n=10)
        self.assertEqual(len(default_fetch), 10)

        # And get arbitrarily large sets by overriding limit.
        unlimited_fetch = User.get(n=float('inf'))
        self.assertEqual(len(unlimited_fetch), 102)

    def test_update_one(self):
        """Updating an object with .put() changes timestamps and coerces as
        expected."""
        # Initial save. Don't do it the normal way so that we can intentionally
        # put a modified time in the past (the other option is to make the
        # tests slow enough for the second-resolution timestamps to differ).
        user = User.create(email='foo')
        user.created = str_to_dt('1970-01-01T00:00:00Z')
        user.modified = user.created
        row_dict = user.coerce_row_dict(user.to_dict())
        with mysql_connection.connect() as sql:
            sql.insert_or_update(User.table, row_dict)

        # Check that timestamps saved correctly.
        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(user.created, fetched_user.created)
        self.assertEqual(user.modified, fetched_user.modified)

        # UPDATE should advance modified timestamps, but not created.
        user.name = 'newly named';
        user.created = str_to_dt('1982-01-01T00:00:00Z')
        # Make sure boolean and json attributes coerced correctly.
        user.receive_sms = False
        user.owned_teams = ['Team_X']
        user.put()
        updated_user = user
        self.assertEqual(updated_user.created, fetched_user.created)
        self.assertGreater(updated_user.modified, fetched_user.modified)
        self.assertEqual(updated_user.receive_sms, False)
        self.assertEqual(updated_user.owned_teams, ['Team_X'])

    def test_update_many(self):
        """Updating many objects with klass.put_multi() changes timestamps and
        coerces as expected."""
        # Initial save. Don't do it the normal way so that we can intentionally
        # put a modified time in the past (the other option is to make the
        # tests slow enough for the second-resolution timestamps to differ).
        users_by_id = {}
        for x in range(2):
            user = User.create(email=x)
            user.created = str_to_dt('1970-01-01T00:00:00Z')
            user.modified = user.created
            users_by_id[user.uid] = user
        with mysql_connection.connect() as sql:
            sql.insert_row_dicts(
                User.table,
                [User.coerce_row_dict(u.to_dict()) for u in users_by_id.values()]
            )

        # Check that timestamps saved correctly.
        fetched_by_id = {u.uid: u for u in User.get_by_id(users_by_id.keys())}
        for uid, u in fetched_by_id.items():
            self.assertEqual(users_by_id[uid].created, u.created)
            self.assertEqual(users_by_id[uid].modified, u.modified)

            # Modify the users to test updating.
            u.name = 'newly named'
            u.created = str_to_dt('1982-01-01T00:00:00Z')
            # Make sure boolean and json attributes coerced correctly.
            u.receive_sms = False
            u.owned_teams = ['Team_X']

        # UPDATE should advance modified timestamps, but not created.
        User.put_multi(fetched_by_id.values())
        refetched_by_id = {u.uid: u for u in User.get_by_id(users_by_id.keys())}
        for uid, u in refetched_by_id.items():
            self.assertEqual(u.created, users_by_id[uid].created)
            self.assertGreater(u.modified, fetched_by_id[uid].modified)
            self.assertEqual(u.receive_sms, fetched_by_id[uid].receive_sms)
            self.assertEqual(u.owned_teams, fetched_by_id[uid].owned_teams)

    def test_put_for_index_new(self):
        """put_for_index() with a new object changes timestamps and coerces as
        expected."""
        user = User.create(
            email='foo',
            receive_sms=False,
            owned_teams=['Team_X'],
        )
        fetched_user = User.put_for_index(user, 'email')

        now = datetime.datetime.now()
        tolerance = datetime.timedelta(seconds=5)

        self.assertLess(now - fetched_user.created, tolerance)
        self.assertLess(now - fetched_user.modified, tolerance)
        self.assertEqual(fetched_user.receive_sms, False)
        self.assertEqual(fetched_user.owned_teams, ['Team_X'])
        self.assertEqual(fetched_user.uid, user.uid)

    def test_put_for_index_update(self):
        """Forcing an overwite into a unique index changes timestamps and
        coerces as expected."""
        # Initial save. We'll overwite this user's email and expect the uid to
        # remain the same. Don't do it the normal way so that we can
        # intentionally put a modified time in the past (the other option is to
        # make the tests slow enough for the second-resolution timestamps to
        # differ).
        user = User.create(email='foo')
        user.created = str_to_dt('1970-01-01T00:00:00Z')
        user.modified = user.created
        row_dict = user.coerce_row_dict(user.to_dict())
        with mysql_connection.connect() as sql:
            sql.insert_or_update(User.table, row_dict)


        # UPDATE should advance modified timestamps, but not created.
        duplicate_user = User.create(email='foo')  # new uid, should be ignored on put
        duplicate_user.created = str_to_dt('1982-01-01T00:00:00Z')
        # Make sure boolean and json attributes coerced correctly.
        duplicate_user.receive_sms = False
        duplicate_user.owned_teams = ['Team_X']
        fetched_user = User.put_for_index(duplicate_user, 'email')

        self.assertEqual(user.created, fetched_user.created)
        self.assertGreater(fetched_user.modified, user.modified)
        self.assertEqual(fetched_user.receive_sms, False)
        self.assertEqual(fetched_user.owned_teams, ['Team_X'])
        # uid of duplicate user is gone
        self.assertEqual(fetched_user.uid, user.uid)
