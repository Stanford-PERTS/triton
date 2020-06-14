"""Tests endpoint /api/cycles[/:id] and /api/teams/:team_id/cycles[/:id]"""

import datetime
import json
import logging
import webapp2
import webtest

from api_handlers import api_routes
from model import Cycle, Program, Team, User
from unit_test_helper import ConsistencyTestCase, jwt_headers
import config
import mysql_connection


class TestApiCycles(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiCycles, self).set_up()

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
                'cycle': Cycle.get_table_definition(),
                'program': Program.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

    def create(self):
        program = Program.create(
            name="Demo",
            label='demo',
            min_cycles=1,
            preview_url='foo.com',
        )
        program.put()

        team = Team.create(name='foo', program_id=program.uid)
        captain = User.create(name='captain', email='cap@team.com',
                              owned_teams=[team.uid])
        team.captain_id = captain.uid
        teammate = User.create(name='teammate', email='mate@team.com',
                               owned_teams=[team.uid])
        other = User.create(name='other', email='other@else.com')
        User.put_multi((other, teammate, captain))
        team.put()

        cycles = (
            # From a different team.
            Cycle.create(
                team_id='Team_other',
                ordinal=1,
                start_date=datetime.date(2000, 1, 1),
                end_date=datetime.date(2000, 1, 1),
            ),
            Cycle.create(
                team_id=team.uid,
                ordinal=1,
                start_date=datetime.date(2000, 1, 1),
                end_date=datetime.date(2000, 2, 1),
            ),
            # Current.
            Cycle.create(
                team_id=team.uid,
                ordinal=2,
                start_date=datetime.date.today(),
                end_date=datetime.date.today() + datetime.timedelta(weeks=4),
            ),
        )
        Cycle.put_multi(cycles)

        return other, teammate, captain, team, cycles

    def test_get_for_team_requires_auth(self):
        response = self.testapp.get(
            '/api/teams/Team_foo/cycles',
            status=401,
        )

    def test_get_for_team(self):
        """You can list cycles for a team you own."""
        other, teammate, captain, team, cycles = self.create()

        # Forbidden for non-members.
        response = self.testapp.get(
            '/api/teams/{}/cycles'.format(team.uid),
            headers=jwt_headers(other),
            status=403
        )

        # Successful for members.
        response = self.testapp.get(
            '/api/teams/{}/cycles'.format(team.uid),
            headers=jwt_headers(teammate),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 2)

        # Can filter by ordinal
        response = self.testapp.get(
            '/api/teams/{}/cycles?ordinal=1'.format(team.uid),
            headers=jwt_headers(teammate),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)
        self.assertEqual(response_list[0]['ordinal'], 1)

    def test_get_current_for_team(self):
        other, teammate, captain, team, cycles = self.create()
        current = cycles[-1]
        response = self.testapp.get(
            '/api/teams/{}/cycles/current'.format(team.uid),
            headers=jwt_headers(teammate),
        )
        self.assertEqual(current.uid, json.loads(response.body)['uid'])

    def test_get_requires_auth(self):
        self.testapp.get('/api/cycles', status=401)

    def test_get(self):
        other, teammate, captain, team, cycles = self.create()
        current = cycles[-1]
        response = self.testapp.get(
            '/api/cycles/{}'.format(current.uid),
            headers=jwt_headers(teammate),
        )
        self.assertEqual(current.uid, json.loads(response.body)['uid'])

    def test_create(self):
        """Only captains can add cycles."""
        other, teammate, captain, team, cycles = self.create()
        last = cycles[-1]
        start_date = last.start_date + datetime.timedelta(weeks=5)
        end_date = last.end_date + datetime.timedelta(weeks=5)

        # Forbidden for non-captains.
        for user in (other, teammate):
            self.testapp.post_json(
                '/api/cycles',
                {
                    'team_id': team.uid,
                    'start_date': start_date.strftime(config.iso_date_format),
                    'end_date': end_date.strftime(config.iso_date_format),
                },
                headers=jwt_headers(user),
                status=403,
            )

        # Successful for captains.
        response = self.testapp.post_json(
            '/api/cycles',
            {
                'team_id': team.uid,
                'start_date': start_date.strftime(config.iso_date_format),
                'end_date': end_date.strftime(config.iso_date_format),
            },
            headers=jwt_headers(captain),
        )
        self.assertIsNotNone(Cycle.get_by_id(json.loads(response.body)['uid']))

    def test_create_insert(self):
        """Server reorders team cycles and returns them in an envelope."""
        other, teammate, captain, team, cycles = self.create()

        # Move the last cycle ahead one month so we have room to insert.
        last = cycles[-1]
        orig_start_date = last.start_date
        orig_end_date = last.end_date
        last.start_date = orig_start_date + datetime.timedelta(weeks=5)
        last.end_date = orig_end_date + datetime.timedelta(weeks=5)
        last.put()

        # Now insert a penultimate cycle.
        response = self.testapp.post_json(
            '/api/cycles?envelope=team_cycles',
            {
                'team_id': team.uid,
                'ordinal': last.ordinal + 1,
                'start_date': orig_start_date.strftime(config.iso_date_format),
                'end_date': orig_end_date.strftime(config.iso_date_format),
            },
            headers=jwt_headers(captain),
        )
        response_dict = json.loads(response.body)

        # New cycle is in the 'data' property.
        self.assertIsNotNone(Cycle.get_by_id(response_dict['data']['uid']))

        # Other metadata is present in the envelope.
        self.assertEqual(response_dict['status'], 200)
        # Specifically the list of other cycles for this team.
        team_cycles = response_dict['team_cycles']
        self.assertEqual(len(team_cycles), 3)

        # The one we created should be second-to-last.
        self.assertEqual(team_cycles[-2]['uid'], response_dict['data']['uid'])
        # All the ordinals should be updated and sorted.
        self.assertEqual(
            [c['ordinal'] for c in team_cycles],
            [1, 2, 3]
        )

    def test_update(self):
        """Only captains can update cycles."""
        other, teammate, captain, team, cycles = self.create()

        # Forbidden for non-captains.
        for user in (teammate, other):
            self.testapp.put_json(
                '/api/cycles/{}'.format(cycles[1].uid),
                {'start_date': 'foo'},
                headers=jwt_headers(user),
                status=403,
            )

        # Successful for captains.
        # This moves both dates earlier.
        response = self.testapp.put_json(
            '/api/cycles/{}?envelope=team_cycles'.format(cycles[2].uid),
            {'start_date': '1999-01-01', 'end_date': '1999-02-01'},
            headers=jwt_headers(captain),
        )
        fetched = Cycle.get_by_id(cycles[2].uid)
        self.assertEqual(fetched.start_date, datetime.date(1999, 1, 1))
        self.assertEqual(fetched.end_date, datetime.date(1999, 2, 1))
        # Should be reordered (this one is now first/earliest on the team).
        self.assertEqual(fetched.ordinal, 1)

        # Response should have all team cycles as meta data.
        response_dict = json.loads(response.body)
        data_cycle = response_dict['data']
        team_cycles = response_dict['team_cycles']
        self.assertEqual(
            [c['uid'] for c in team_cycles],
            [cycles[2].uid, cycles[1].uid],  # reversed from earlier
        )
        self.assertEqual(
            [c['ordinal'] for c in team_cycles],
            [1, 2],  # correctly ordered by date
        )
        # Main data object matches corresponding cycle in envelope.
        self.assertEqual(
            response_dict['data'],
            next(c for c in team_cycles if c['uid'] == data_cycle['uid']),
        )

        # Should also be possible to move just the end date forward (overlap
        # code should not see this as a problem).
        new_end = cycles[1].end_date + datetime.timedelta(weeks=1)
        response = self.testapp.put_json(
            '/api/cycles/{}?envelope=team_cycles'.format(cycles[1].uid),
            {'end_date': new_end.strftime(config.iso_date_format)},
            headers=jwt_headers(captain),
        )

        fetched = Cycle.get_by_id(cycles[1].uid)
        self.assertEqual(fetched.end_date, new_end)

        response_dict = json.loads(response.body)
        data_cycle = response_dict['data']
        team_cycles = response_dict['team_cycles']
        # Main data object matches corresponding cycle in envelope.
        self.assertEqual(
            response_dict['data'],
            next(c for c in team_cycles if c['uid'] == data_cycle['uid']),
        )

    def test_overlap_forbidden(self):
        other, teammate, captain, team, cycles = self.create()

        # Try to create a new cycle that wraps the others.
        before = cycles[1].start_date - datetime.timedelta(days=1)
        after = cycles[2].end_date + datetime.timedelta(days=1)
        wrapping_params = {
            'team_id': team.uid,
            'ordinal': 1,
            'start_date': before.strftime(config.iso_date_format),
            'end_date': after.strftime(config.iso_date_format),
        }
        self.testapp.post_json(
            '/api/cycles',
            wrapping_params,
            headers=jwt_headers(captain),
            status=400,
        )

        # Nothing created in db.
        self.assertEqual(len(Cycle.get()), 3)

        # Same story for updating.
        self.testapp.put_json(
            '/api/cycles/{}'.format(cycles[1].uid),
            wrapping_params,
            headers=jwt_headers(captain),
            status=400,
        )

        # Cycle's dates haven't changed.
        fetched = Cycle.get_by_id(cycles[1].uid)
        self.assertEqual(fetched.start_date, cycles[1].start_date)
        self.assertEqual(fetched.end_date, cycles[1].end_date)

    def test_delete(self):
        """Only team captains can delete cycles."""
        other, teammate, captain, team, cycles = self.create()
        other = User.create(name='other', email='other@bar.com')
        other.put()

        # Forbidden by non-captains.
        for user in (teammate, other):
            self.testapp.delete(
                '/api/cycles/{}'.format(cycles[1].uid),
                headers=jwt_headers(user),
                status=403,
            )

        # Successful by captain.
        self.testapp.delete(
            '/api/cycles/{}'.format(cycles[1].uid),
            headers=jwt_headers(captain),
            status=204,
        )
        self.assertIsNone(Cycle.get_by_id(cycles[1].uid))

        # Forbidden if cycles are too few.
        self.testapp.delete(
            '/api/cycles/{}'.format(cycles[2].uid),
            headers=jwt_headers(captain),
            status=403,
        )
        # The last cycle wasn't deleted.
        self.assertIsNotNone(Cycle.get_by_id(cycles[2].uid))
