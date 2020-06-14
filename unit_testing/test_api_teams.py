"""Test endpoints /api/teams/X and /api/users/X/teams.

Indirectly tests RestHandler with SqlModel. Other api suites may be less
comprehensive because they naively inherit from RestHandler and wouldn't
benefit from extra coverage.
"""

import logging
import unittest
import webapp2
import webtest

from api_handlers import api_routes
from model import (
    Classroom, Cycle, Email, Program, Organization, Report, Survey, Team, User
)
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection


class TestApiTeams(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    demo_program = None

    # So we can look at what emails are queued right away.
    consistency_probability = 1

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiTeams, self).set_up()

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
                'classroom': Classroom.get_table_definition(),
                'cycle': Cycle.get_table_definition(),
                'program': Program.get_table_definition(),
                'organization': Organization.get_table_definition(),
                'report': Report.get_table_definition(),
                'survey': Survey.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        # See #848. Remove once resolved.
        self.demo_program = Program.create(
            name="Demo Program",
            label='demoprogram',
            min_cycles=3,
            active=True,
            preview_url='foo.com',
        )
        self.demo_program.put()

        self.ep_program = Program.create(
            name="Engagement Project",
            label='ep19',
            min_cycles=3,
            active=True,
            preview_url='foo.com',
        )
        self.ep_program.put()

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def test_get_all_requires_auth(self):
        response = self.testapp.get(
            '/api/teams',
            status=401,
        )

    def test_get_own_requires_auth(self):
        response = self.testapp.get(
            '/api/users/User_foo/teams',
            status=401,
        )

    def test_get_all_forbidden(self):
        """Non-supers get 403."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/teams',
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_all_super(self):
        """Supers can query all teams."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.demo_program.uid)
        team.put()
        user = User.create(name='super', email='super@bar.com',
                           user_type='super_admin')
        user.put()
        response = self.testapp.get(
            '/api/teams',
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def create_for_paging(self, n):
        # Pad numeric names so they sort alphabetically.
        teams = [
            Team.create(name=str(x).rjust(2, '0'), captain_id='User_captain',
                        program_id=self.demo_program.uid)
            for x in range(n)
        ]
        Team.put_multi(teams)
        super_admin = User.create(name='super', email='super@bar.com',
                                  user_type='super_admin')
        super_admin.put()

        return teams, super_admin

    def test_get_first_page(self):
        teams, super_admin = self.create_for_paging(20)

        response = self.testapp.get(
            '/api/teams?n=10',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)

        # We should have the first 10 results, in alphabetical order.
        self.assertEqual([t.uid for t in teams[:10]],
                         [t['uid'] for t in response_list])

    def test_get_offset_page(self):
        teams, super_admin = self.create_for_paging(20)

        response = self.testapp.get(
            '/api/teams?n=10&cursor=11',
            headers=self.login_headers(super_admin),
        )
        response_list = json.loads(response.body)

        # We should have results 11-20, in order.
        self.assertEqual([t.uid for t in teams[11:]],
                         [t['uid'] for t in response_list])

    def test_link_header(self):
        # 5 teams for first, previous, current, next, and last.
        teams, super_admin = self.create_for_paging(5)

        response = self.testapp.get(
            '/api/teams?n=1&cursor=2',
            headers=self.login_headers(super_admin),
        )
        self.assertEqual(
            response.headers['Link'],
            '</api/teams?n=1&cursor=2&order=name>;rel=self,'
            '</api/teams?order=name&n=1>;rel=first,'
            '</api/teams?cursor=1&order=name&n=1>;rel=previous,'
            '</api/teams?cursor=3&order=name&n=1>;rel=next,'
            '</api/teams?cursor=4&order=name&n=1>;rel=last',
        )

    def test_get_all_for_self(self):
        """You can list your own teams."""
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.demo_program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()
        response = self.testapp.get(
            '/api/users/{}/teams'.format(user.uid),
            headers=self.login_headers(user),
        )
        response_list = json.loads(response.body)
        self.assertEqual(len(response_list), 1)

    def test_get_owned(self):
        """You can get a team you own."""
        program = Program.create(
            name='Program Foo',
            label='TP1',
            preview_url='foo.com',
        )
        program.put()
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()
        classroom = Classroom.create(name='foo', team_id=team.uid,
                                     contact_id=user.uid, code='trout viper')
        classroom.put()

        response = self.testapp.get(
            '/api/teams/{}'.format(team.uid),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict['uid'], team.uid)

        # Should have allowed endpoints for all contained classrooms.
        jwt_payload, error = jwt_helper.decode(
            response.headers['Authorization'][7:])
        self.assertEqual(
            jwt_payload['allowed_endpoints'],
            [
                'GET //neptune/api/project_cohorts/trout-viper/participation',
                # This endpoint is available also b/c the user is the main
                # contact of this classroom.
                'GET //neptune/api/project_cohorts/trout-viper/completion'
            ],
        )

    def test_get_for_other_forbidden(self):
        """You can't list someone else's teams."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/users/User_other/teams',
            headers=self.login_headers(user),
            status=403
        )

    def create(self, org_code=None):
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        team_params = {'name': 'Team Foo', 'program_id': self.demo_program.uid}
        if org_code:
            team_params['organization_code'] = org_code
        response = self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(user),
        )
        team_dict = json.loads(response.body)

        # Remove user's cookie so we can use the test app as other people.
        self.testapp.reset()
        return user, team_dict

    def test_create(self):
        """Anyone can create a team with themselves as captain."""

        # Success.
        user, team_dict = self.create()
        self.assertEqual(team_dict['captain_id'], user.uid)

        fetched_user = User.get_by_id(user.uid)
        self.assertEqual(fetched_user.owned_teams, [team_dict['uid']])

        # Program not found.
        team_params = {'name': 'Team Foo', 'program_id': 'Program_dne'}
        self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(user),
            status=400,
        )

        # Inactive program.
        inactive_program = Program.create(
            name="Inactive Program",
            label='inactive',
            active=False,
            preview_url='foo.com',
        )
        inactive_program.put()
        self.testapp.post_json(
            '/api/teams',
            dict(team_params, program_id=inactive_program.uid),
            headers=self.login_headers(user),
            status=400,
        )

    def test_create_first_sends_email(self):
        """If, on POST, user is captain of one ep team, they get an email."""

        captain_first = User.create(name='foo', email='foo@bar.com')
        captain_first.put()

        # Demo program doesn't trigger any emails.
        team_params = {'name': 'Demo 1', 'program_id': self.demo_program.uid}
        self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(captain_first),
        )
        self.assertEqual(Email.count(), 0)

        # First team created for EP sends email (even though they have a team
        # on another program).
        team_params = {'name': 'EP 1', 'program_id': self.ep_program.uid}
        result1 = self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(captain_first),
        )
        self.assertEqual(Email.count(), 1)
        email1 = Email.get()[0]
        self.assertEqual(email1.template, 'ep19/welcome.html')
        self.assertEqual(email1.to_address, captain_first.email)

        # User who already is on another team, but isn't captain, then creates
        # a team, gets the email.
        team1_id = json.loads(result1.body)['uid']
        member_first = User.create(name="Member", email="member@first.com",
                                   owned_teams=[team1_id])
        member_first.put()
        team_params = {'name': 'EP 2', 'program_id': self.ep_program.uid}
        result2 = self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(member_first),
        )
        email2 = next(e for e in Email.get()
                     if e.to_address == member_first.email)
        self.assertEqual(email2.template, 'ep19/welcome.html')

        # User who creates a second team doesn't get the email.
        team_params = {'name': 'EP 3', 'program_id': self.ep_program.uid}
        result3 = self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(captain_first),
        )
        captain_first_emails = [e for e in Email.get()
                                if e.to_address == captain_first.email]

        # Only the first email is there, no second email.
        self.assertEqual(len(captain_first_emails), 1)

    def test_create_with_org_codes(self, org=None):
        """Can send org code(s) on POST to associate with team."""
        other_program = Program.create(
            name='Test Program',
            label='TP1',
            metrics=['Metric_1', 'Metric_2'],
            min_cycles=2,
            active=False,
            preview_url='foo.com',
        )
        other_program.put()
        if org is None:
            org = Organization.create(
                name='Org Correct',
                program_id=self.demo_program.uid,
                code='correct code',
            )
        org2 = Organization.create(
            name='Org Second',
            program_id=self.demo_program.uid,
            code='second code',
        )
        other_org = Organization.create(
            name='Org Other',
            program_id=other_program.uid,
            code='other code',
        )
        Organization.put_multi([org, org2, other_org])
        user = User.create(name='foo', email='foo@bar.com')
        user.put()

        # Invalid org code.
        team_params = {
            'name': 'Team Foo',
            'organization_code': 'does not exist',
            'program_id': self.demo_program.uid,
        }
        self.testapp.post_json(
            '/api/teams',
            team_params,
            headers=self.login_headers(user),
            status=400,
        )

        # Org program and team program don't match.
        self.testapp.post_json(
            '/api/teams',
            dict(team_params, organization_code=other_org.code),
            headers=self.login_headers(user),
            status=400,
        )

        # Success.
        multi_code = ', '.join([org.code, org2.code])
        response = self.testapp.post_json(
            '/api/teams',
            dict(team_params, organization_code=multi_code),
            headers=self.login_headers(user),
        )
        team_dict = json.loads(response.body)

        self.assertEqual(
            set(team_dict['organization_ids']),
            set([org.uid, org2.uid]),
        )
        self.assert_created_with_program(team_dict, self.demo_program)

    def assert_created_with_program(self, team_dict, program):
        # Survey should have program's metrics.
        survey = Survey.get(team_id=team_dict['uid'])[0]
        self.assertEqual(survey.metrics, program.metrics)
        self.assertEqual(survey.open_responses, program.metrics)

        # Correct number of cycles created.
        cycles = Cycle.get(team_id=team_dict['uid'])
        self.assertEqual(len(cycles), program.min_cycles or 0)

    def test_put_own(self):
        user, team_dict = self.create()
        team_dict['name'] = 'Team Bar'
        response = self.testapp.put_json(
            '/api/teams/{}'.format(team_dict['uid']),
            team_dict,
            headers=self.login_headers(user),
        )
        self.assertEqual(json.loads(response.body)['name'], team_dict['name'])

    def test_put_other(self):
        user = User.create(name='foo', email='foo@bar.com')
        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.demo_program.uid)
        team.put()

        response = self.testapp.put_json(
            '/api/teams/{}'.format(team.uid),
            {'name': 'Team Other'},
            headers=self.login_headers(user),
            status=403,
        )

    def test_add_org(self):
        captain = User.create(name='captain', email='cap@bar.com')
        team = Team.create(name='Team Foo', captain_id=captain.uid,
                           program_id=self.demo_program.uid)
        org = Organization.create(name='Org Bar',
                                  program_id=self.demo_program.uid)

        captain.owned_teams = [team.uid]

        team.put()
        captain.put()
        org.put()

        response = self.testapp.post_json(
            '/api/teams/{}/organizations'.format(team.uid),
            {'organization_code': org.code},
            headers=self.login_headers(captain),
        )
        response_dict = json.loads(response.body)
        self.assertEqual(response_dict[0]['uid'], org.uid)

    def test_add_org_team_not_found(self):
        captain = User.create(name='captain', email='cap@bar.com')
        team_id = 'Team_foo'
        org = Organization.create(
            name='Org Bar', program_id=self.demo_program.uid)

        captain.owned_teams = [team_id]

        captain.put()
        org.put()

        response = self.testapp.post_json(
            '/api/teams/{}/organizations'.format(team_id),
            {'organization_code': org.code},
            headers=self.login_headers(captain),
            status=404,
        )

    def test_add_org_not_found(self):
        captain = User.create(name='captain', email='cap@bar.com')
        team = Team.create(name='Team Foo', captain_id=captain.uid,
                           program_id=self.demo_program.uid)
        org = Organization.create(name='Org Bar', program_id='Program_other')

        captain.owned_teams = [team.uid]

        team.put()
        org.put()
        captain.put()

        # Forbidden b/c org doesn't exist
        response = self.testapp.post_json(
            '/api/teams/{}/organizations'.format(team.uid),
            {'organization_code': 'dne'},
            headers=self.login_headers(captain),
            status=400,
        )

        # Forbidden b/c org isn't on the same program.
        response = self.testapp.post_json(
            '/api/teams/{}/organizations'.format(team.uid),
            {'organization_code': org.code},
            headers=self.login_headers(captain),
            status=400,
        )

    def test_add_org_forbidden(self):
        member = User.create(name='member', email='member@bar.com')
        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.demo_program.uid)
        org = Organization.create(
            name='Org Bar', program_id=self.demo_program.uid)

        member.owned_teams = [team.uid]

        team.put()
        member.put()
        org.put()

        response = self.testapp.post_json(
            '/api/teams/{}/organizations'.format(team.uid),
            {'organization_code': org.code},
            headers=self.login_headers(member),
            status=403,
        )

    def test_delete_by_captain(self):
        """Captains can delete their teams."""
        user, team_dict = self.create()
        response = self.testapp.delete(
            '/api/teams/{}'.format(team_dict['uid']),
            headers=self.login_headers(user),
        )
        self.assertIsNone(Team.get_by_id(team_dict['uid']))
        return response, user, team_dict

    def test_delete_issues_allowed_endpoints_jwt(self):
        """DELETE response has special jwt giving permission on Neptune."""
        user, team_dict = self.create()
        # Add some classrooms.
        c1 = Classroom.create(
            name='C1',
            team_id=team_dict['uid'],
            contact_id='User_contact',
            code='a a',
        )
        c2 = Classroom.create(
            name='C2',
            team_id=team_dict['uid'],
            contact_id='User_contact',
            code='b b',
        )
        Classroom.put_multi([c1, c2])

        response = self.testapp.delete(
            '/api/teams/{}'.format(team_dict['uid']),
            headers=self.login_headers(user),
        )

        jwt = response.headers['Authorization'][7:]  # drop "Bearer "
        payload, error = jwt_helper.decode(jwt)
        # Should include an endpoint for each classroom.
        self.assertEqual(
            set(payload['allowed_endpoints']),
            {
                'DELETE //neptune/api/codes/a-a',
                'DELETE //neptune/api/codes/b-b',
            },
        )

    def test_delete_other_forbidden(self):
        user, team_dict = self.create()
        other = User.create(name='other', email='other@bar.com')
        other.put()
        response = self.testapp.delete(
            '/api/teams/{}'.format(team_dict['uid']),
            headers=self.login_headers(other),
            status=403
        )
        self.assertIsNotNone(Team.get_by_id(team_dict['uid']))

    def test_delete_own_forbidden(self):
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.demo_program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()
        response = self.testapp.delete(
            '/api/teams/{}'.format(team.uid),
            headers=self.login_headers(user),
            status=403
        )
        self.assertIsNotNone(Team.get_by_id(team.uid))

    def test_captain_changes_captain(self):
        """Only captains can change the captain."""
        user, team_dict = self.create()
        response = self.testapp.put_json(
            '/api/teams/{}'.format(team_dict['uid']),
            {'captain_id': 'User_foo'},
            headers=self.login_headers(user),
        )
        self.assertEqual(json.loads(response.body)['captain_id'], 'User_foo')

    def test_change_captain_forbidden(self):
        team = Team.create(name='foo', captain_id='User_cap',
                           program_id=self.demo_program.uid)
        team.put()
        user = User.create(name='foo', email='foo@bar.com',
                           owned_teams=[team.uid])
        user.put()
        response = self.testapp.put_json(
            '/api/teams/{}'.format(team.uid),
            {'captain_id': user.uid},
            headers=self.login_headers(user),
            status=403,
        )
        team = Team.get_by_id(team.uid)
        self.assertNotEqual(team.captain_id, user.uid)

    def test_delete_forbidden(self):
        """Only team captains can delete teams."""
        contact = User.create(name='contact', email='contact@bar.com')
        teammate = User.create(name='teammate', email='teammate@bar.com')
        other = User.create(name='other', email='other@bar.com')

        team = Team.create(name='Team Foo', captain_id='User_captain',
                           program_id=self.demo_program.uid)
        team.put()

        contact.owned_teams = [team.uid]
        teammate.owned_teams = [team.uid]
        User.put_multi([contact, teammate, other])

        for user in (contact, teammate, other):
            self.testapp.delete(
                '/api/teams/{}'.format(team.uid),
                headers=self.login_headers(user),
                status=403,
            )

    def test_delete_removes_team(self):
        user = User.create(name='foo', email='foo@bar.com')

        team = Team.create(name='Team Foo', captain_id=user.uid,
                           program_id=self.demo_program.uid)
        team.put()

        user.owned_teams = [team.uid]
        user.put()

        survey = Survey.create(team_id=team.uid)
        survey.put()

        url = '/api/teams/{}'.format(team.uid)
        headers = self.login_headers(user)

        # Delete the team.
        self.testapp.delete(url, headers=headers, status=204)

        # Expect the team is gone from the db.
        self.assertIsNone(Team.get_by_id(team.uid))

        # Api should show a 404.
        self.testapp.get(url, headers=headers, status=404)
        self.testapp.delete(url, headers=headers, status=404)

    def test_delete_removes_related(self):
        user = User.create(name='foo', email='foo@bar.com')

        team = Team.create(name='Team Foo', captain_id=user.uid,
                           program_id=self.demo_program.uid)
        team.put()

        survey = Survey.create(team_id=team.uid)
        survey.put()

        user.owned_teams = [team.uid]
        user.put()

        classroom1 = Classroom.create(
            name='Classroom One',
            code='trout viper',
            team_id=team.uid,
            contact_id='User_contact',
            num_students=22,
            grade_level='9-12',
        )
        classroom1.put()
        classroom2 = Classroom.create(
            name='Classroom Two',
            code='trout viper',
            team_id=team.uid,
            contact_id='User_contact',
            num_students=22,
            grade_level='9-12',
        )
        classroom2.put()

        report1 = Report.create(
            team_id=team.uid,
            classroom_id=classroom1.uid,
            filename='report1.pdf',
            gcs_path='/upload/abc',
            size=10,
            content_type='application/pdf',
        )
        report1.put()
        report2 = Report.create(
            team_id=team.uid,
            classroom_id=classroom2.uid,
            filename='report2.pdf',
            gcs_path='/upload/def',
            size=10,
            content_type='application/pdf',
        )
        report2.put()

        url = '/api/teams/{}'.format(team.uid)
        headers = self.login_headers(user)

        # Delete the team.
        self.testapp.delete(url, headers=headers, status=204)

        # Expect the survey, classrooms, and related reports are gone from the
        # db.
        self.assertIsNone(Survey.get_by_id(survey.uid))
        self.assertIsNone(Classroom.get_by_id(classroom1.uid))
        self.assertIsNone(Classroom.get_by_id(classroom2.uid))
        self.assertIsNone(Report.get_by_id(report1.uid))
        self.assertIsNone(Report.get_by_id(report2.uid))

    def test_delete_removes_all_ownership(self):
        captain = User.create(name='cap', email='cap@bar.com')
        member = User.create(name='member', email='member@bar.com')

        team = Team.create(name='Team Foo', captain_id=captain.uid,
                           program_id=self.demo_program.uid)
        team.put()

        captain.owned_teams = [team.uid]
        member.owned_teams = [team.uid]
        captain.put()
        member.put()

        survey = Survey.create(team_id=team.uid)
        survey.put()

        url = '/api/teams/{}'.format(team.uid)
        headers = self.login_headers(captain)

        # Delete the team.
        self.testapp.delete(url, headers=headers, status=204)

        # All users should now not be associated to the deleted team.
        self.assertNotIn(team.uid, User.get_by_id(captain.uid).owned_teams)
        self.assertNotIn(team.uid, User.get_by_id(member.uid).owned_teams)

    def test_get_by_organization(self):
        """Can get all teams on an org."""
        org = Organization.create(
            name="Foo Org", program_id=self.demo_program.uid)
        org.put()
        user, team_dict = self.create(org_code=org.code)
        user.owned_organizations.append(org.uid)
        user.put()

        response = self.testapp.get(
            '/api/organizations/{}/teams'.format(org.uid),
            headers=self.login_headers(user),
        )
        self.assertEqual(len(json.loads(response.body)), 1)

    def test_get_by_organization_forbidden(self):
        """Can't get org teams if you don't own org."""
        user = User.create(name='foo', email='foo@bar.com')
        user.put()
        response = self.testapp.get(
            '/api/organizations/Organization_foo/teams',
            headers=self.login_headers(user),
            status=403,
        )

    def test_get_by_organization_requires_auth(self):
        response = self.testapp.get(
            '/api/organizations/Organization_foo/teams',
            status=401,
        )

    def test_task_data_too_large(self):
        user = User.create(name='foo', email='foo@bar.com')
        user.put()

        team_params = {'name': 'Team Foo', 'program_id': self.demo_program.uid}

        # A property is too long.
        self.testapp.post_json(
            '/api/teams',
            dict(team_params, task_data={'foo': 'x' * 10**5}),
            headers=self.login_headers(user),
            status=413,
        )

        # Too many properties.
        self.testapp.post_json(
            '/api/teams',
            dict(
                team_params,
                task_data={'foo{}'.format(x): 'x' for x in range(10**3)},
            ),
            headers=self.login_headers(user),
            status=413,
        )

        # Both posts should have prevented teams from being stored.
        self.assertEqual(len(Team.get()), 0)

        # Successful POST
        response = self.testapp.post_json(
            '/api/teams',
            dict(team_params, task_data={'safe': 'data'}),
            headers=self.login_headers(user),
        )
        response_dict = json.loads(response.body)
        put_url = '/api/teams/{}'.format(response_dict['uid'])

        # Same errors but for PUT
        # A property is too long.
        self.testapp.put_json(
            put_url,
            {'task_data': {'foo': 'x' * 10**5}},
            headers=self.login_headers(user),
            status=413,
        )
        # Too many properties.
        self.testapp.put_json(
            put_url,
            {'task_data': {'foo{}'.format(x): 'x' for x in range(10**3)}},
            headers=self.login_headers(user),
            status=413,
        )

        # Puts should have left body unchanged.
        self.assertEqual(
            Team.get_by_id(response_dict['uid']).task_data,
            {'safe': 'data'},
        )

    def test_team_in_program_with_use_cycles_false_gets_single_cycle(self):
        user = User.create(name='foo', email='foo@bar.com')
        user.put()

        cycleless_program = Program.create(
            label='cycleless',
            name='Cycleless Program',
            preview_url='http://cycle.less',
            use_cycles=False,
            min_cycles=1,
            max_cycles=1
        )
        cycleless_program.put()

        cycleless_team_params = {
            "name": 'Cycleless Team',
            "uid": 'Team_cycleless',
            "program_id": cycleless_program.uid
        }
        response = self.testapp.post_json(
            '/api/teams',
            cycleless_team_params,
            headers=self.login_headers(user)
        )

        team_uid = json.loads(response.body)['uid']

        cycles = Cycle.get(team_id=team_uid)

        self.assertEqual(len(cycles), 1)
