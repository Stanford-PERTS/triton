"""Tests endpoint /api/classrooms/X/reports.

Indirectly tests RelatedQuery with SqlModel. Other suites may skip handlers
naively inherit from the same code.
"""

from google.appengine.ext import testbed
from mock import patch, mock_open
import datetime
import hashlib
import logging
import os
import unittest
from urlparse import urlparse
import webapp2
import webtest

from api_handlers import api_routes
from model import Classroom, Network, Organization, Program, Report, Team, User
from unit_test_helper import ConsistencyTestCase
import config
import json
import jwt_helper
import mysql_connection
import util


class TestApiReports(ConsistencyTestCase):
    cookie_name = config.session_cookie_name
    cookie_key = config.default_session_cookie_secret_key

    valid_jwt = None

    def set_up(self):
        # Let ConsistencyTestCase set up the datastore testing stub.
        super(TestApiReports, self).set_up()

        # Necessary to determine gcs upload bucket name.
        self.testbed.init_app_identity_stub()
        self.testbed.init_urlfetch_stub()
        self.testbed.init_blobstore_stub()

        application = self.patch_webapp(webapp2.WSGIApplication)(
            api_routes,
            config={
                'webapp2_extras.sessions': {
                    'secret_key': self.cookie_key
                }
            },
            debug=True
        )
        self.testapp = webtest.TestApp(application)

        self.taskqueue_stub = self.testbed.get_stub(
            testbed.TASKQUEUE_SERVICE_NAME)

        with mysql_connection.connect() as sql:
            sql.reset({
                'classroom': Classroom.get_table_definition(),
                'organization': Organization.get_table_definition(),
                'program': Program.get_table_definition(),
                'report': Report.get_table_definition(),
                'team': Team.get_table_definition(),
                'user': User.get_table_definition(),
            })

        if self.valid_jwt is None:
            self.valid_jwt = jwt_helper.encode_rsa({
                'user_id': 'User_rserve',
                'email': 'rserve@perts.net',
                'user_type': 'super_admin',
            })

        self.program = Program.create(
            name="Engagement Project",
            label='ep18',
            min_cycles=3,
            active=True,
            preview_url='foo.com',
        )
        self.program.put()

    def patch_webapp(self, WSGIApplication):
        """Webapp doesn't allow PATCH by default. See wsgi.py."""
        allowed = WSGIApplication.allowed_methods
        WSGIApplication.allowed_methods = allowed.union(('PATCH',))
        return WSGIApplication

    def login_headers(self, user):
        payload = {'user_id': user.uid, 'email': user.email}
        return {'Authorization': 'Bearer ' + jwt_helper.encode(payload)}

    def create(self):
        other = User.create(name='other', email='other@bar.com')
        teammate = User.create(name='teammate', email='team@bar.com')
        contact = User.create(name='contact', email='contact@bar.com')
        captain = User.create(name='captain', email='captain@bar.com')
        super_admin = User.create(name='super', email='super@bar.com',
                                  user_type='super_admin')

        team = Team.create(name='Team foo', captain_id=captain.uid,
                           program_id=self.program.uid)
        team.put()

        classroom = Classroom.create(name='Class foo', team_id=team.uid,
                                     code='trout viper',
                                     contact_id=contact.uid)
        classroom.put()

        teammate.owned_teams.append(team.uid)
        contact.owned_teams.append(team.uid)
        captain.owned_teams.append(team.uid)

        User.put_multi((other, teammate, contact, captain, super_admin))

        return (other, teammate, contact, captain, super_admin, team,
                classroom)

    def create_reports(self):
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()

        classReport1 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='foo.pdf',
            gcs_path='/mybucket/upload/12345.pdf',
            size=1000000,
            content_type='application/pdf',
            preview=False,
        )
        classReport2 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='bar.pdf',
            gcs_path='/mybucket/upload/23456.pdf',
            size=1000000,
            content_type='application/pdf',
            preview=False,
        )
        teamReport = Report.create(
            team_id=team.uid,
            classroom_id=None,
            filename='team.pdf',
            gcs_path='/mybucket/upload/34567.pdf',
            size=1000000,
            content_type='application/pdf',
            preview=False,
        )
        Report.put_multi((classReport1, classReport2, teamReport))

        return (other, teammate, contact, captain, super_admin, team,
                classroom, classReport1, classReport2, teamReport)

    def create_dataset_reports(self):
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()

        classReport1 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='foo.html',
            dataset_id='Dataset_class1',
            template='class_template',
            content_type='text/html',
            preview=False,
        )
        classReport2 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='bar.html',
            dataset_id='Dataset_class2',
            template='class_template',
            content_type='text/html',
            preview=False,
        )
        teamReport = Report.create(
            team_id=team.uid,
            classroom_id=None,
            filename='team.html',
            dataset_id='Dataset_team',
            template='team_template',
            content_type='text/html',
            preview=False,
        )
        Report.put_multi((classReport1, classReport2, teamReport))

        return (other, teammate, contact, captain, super_admin, team,
                classroom, classReport1, classReport2, teamReport)

    def test_list_forbidden(self):
        """Those not on the team may not list reports."""
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        for user in (other,):
            self.testapp.get(
                '/api/teams/{}/reports'.format(team.uid),
                headers=self.login_headers(user),
                status=403,
            )

    def test_list_allowed(self):
        """Those on the team may list reports."""
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        # Teammate and captain only get the team report.
        for user in (teammate, captain):
            response = self.testapp.get(
                '/api/teams/{}/reports'.format(team.uid),
                headers=self.login_headers(user),
            )
            self.assertEqual(
                set(d['uid'] for d in json.loads(response.body)),
                {teamReport.uid},
            )

        # Contact and super gets classroom reports also.
        for user in (contact, super_admin):
            response = self.testapp.get(
                '/api/teams/{}/reports'.format(team.uid),
                headers=self.login_headers(user),
            )
            self.assertEqual(
                set(d['uid'] for d in json.loads(response.body)),
                {teamReport.uid, classReport1.uid, classReport2.uid},
            )

    def test_list_preview(self):
        """Preview reports only visible to super admins."""
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()

        classReport1 = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='foo.pdf',
            gcs_path='/mybucket/upload/12345.pdf',
            size=1000000,
            content_type='application/pdf',
            preview=True,
        )
        teamReport = Report.create(
            team_id=team.uid,
            classroom_id=None,
            filename='team.pdf',
            gcs_path='/mybucket/upload/34567.pdf',
            size=1000000,
            content_type='application/pdf',
            preview=True,
        )
        Report.put_multi((classReport1, teamReport))

        # Contact and captain see an empty list.
        for user in (contact, captain):
            response = self.testapp.get(
                '/api/teams/{}/reports'.format(team.uid),
                headers=self.login_headers(user),
            )
            self.assertEqual(response.body, '[]')

        # Super sees preview reports.
        response = self.testapp.get(
            '/api/teams/{}/reports'.format(team.uid),
            headers=self.login_headers(super_admin),
        )
        self.assertEqual(
            set(d['uid'] for d in json.loads(response.body)),
            {teamReport.uid, classReport1.uid},
        )

    def test_list_dataset_reports(self):
        (
            other, teammate, contact, captain, super_admin, team, classroom,
            class_report_1, class_report_2, team_report
        ) = self.create_dataset_reports()

        response = self.testapp.get(
            '/api/teams/{}/reports'.format(team.uid),
            headers=self.login_headers(contact),
        )
        reports = json.loads(response.body)

        # Should have correct path.
        expected_paths = {
            '/datasets/team/team_template/team.html',
            '/datasets/class2/class_template/bar.html',
            '/datasets/class1/class_template/foo.html',
        }
        self.assertEqual(
            set(urlparse(r['link']).path for r in reports),
            expected_paths,
        )

        # Jwt should match the path.
        for r in reports:
            url, token = r['link'].split('?token=')
            payload, error = jwt_helper.decode(token)
            self.assertIn(
                'GET //neptune' + urlparse(url).path,
                payload['allowed_endpoints']
            )

    def test_list_network_reports(self):
        network = Network.create(name="Foo Net", program_id="Program_foo")
        network.put()
        admin = User.create(email="net@admin.edu",
                            owned_networks=[network.uid])
        admin.put()

        template = 'network_tempate'
        filename = 'foo.html'

        report = Report.create(
            network_id=network.uid,
            filename=filename,
            dataset_id='Dataset_class1',
            template=template,
            content_type='text/html',
            preview=False,
        )
        report.put()

        response = self.testapp.get(
            '/api/networks/{}/reports'.format(network.uid),
            headers=self.login_headers(admin),
        )
        reports = json.loads(response.body)

        self.assertEqual(
            urlparse(reports[0]['link']).path,
            '/datasets/{}/{}/{}'.format(report.uid, template, filename),
        )

        url, token = reports[0]['link'].split('?token=')
        payload, error = jwt_helper.decode(token)
        self.assertIn(
            'GET //neptune' + urlparse(url).path,
            payload['allowed_endpoints']
        )

    def test_post_forbidden(self):
        """Only supers can post new reports."""
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        for user in (other, teammate, contact, captain):
            self.testapp.post(
                '/api/reports',
                {},
                headers=self.login_headers(user),
                status=403,
            )

    def test_get_pdf_missing_token_bad_request(self):
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        self.testapp.get(
            '/api/classrooms/{}/reports/foo.pdf'.format(classReport1.uid),
            headers=self.login_headers(contact),
            status=400,
        )

    def test_get_pdf_bad_token_forbidden(self):
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        # Not any old jwt will do. For instance, the typical auth jwt doesn't
        # work as a token.
        path = '/api/classrooms/{}/reports/foo.pdf?token={}'.format(
            classReport1.uid,
            jwt_helper.encode({'user_id': contact.uid, 'email': contact.email})
        )
        self.testapp.get(
            path,
            headers=self.login_headers(contact),
            status=403,
        )

    def test_get_pdf_expired_token_forbidden(self):
        """Special case of invalid token."""
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        # Not any old jwt will do. For instance, the typical auth jwt doesn't
        # work as a token.
        path = '/api/classrooms/{}/reports/foo.pdf?token={}'.format(
            classReport1.uid,
            jwt_helper.encode(
                {'user_id': contact.uid, 'email': contact.email},
                expiration_minutes=-1,
            ),
        )
        self.testapp.get(
            path,
            headers=self.login_headers(contact),
            status=403,
        )

    def create_for_post(self, filename):
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()

        file_contents = 'some stuff'
        gcs_path = '/{}{}/{}'.format(
            util.get_upload_bucket(),
            os.environ['GCS_UPLOAD_PREFIX'],
            hashlib.md5(file_contents).hexdigest(),
        )

        # We need something to upload; mock a file for webtest to find.
        with patch('__main__.open', mock_open()):
            with open(filename, 'w') as fh:
                fh.write(file_contents)
                fh.seek(0, os.SEEK_END)
                file_size = fh.tell()

        return (other, teammate, contact, captain, super_admin, team,
                classroom, gcs_path, file_size)

    def test_post_class_pdf(self):
        today_str = datetime.date.today().strftime(config.iso_date_format)
        filename = 'Classroom_filewhack.{}.pdf'.format(today_str)
        (
            other, teammate, contact, captain, super_admin, team, classroom,
            gcs_path, file_size
        ) = self.create_for_post(filename)

        response = self.testapp.post(
            '/api/reports',
            {'classroom_id': classroom.uid, 'filename': filename},
            upload_files=[('file', filename)],
            headers=self.login_headers(super_admin),
        )
        report_dict = json.loads(response.body)
        fetched = Report.get_by_id(report_dict['uid'])

        self.assertEqual(fetched.team_id, team.uid)
        self.assertEqual(fetched.classroom_id, classroom.uid)
        self.assertEqual(fetched.filename, filename)
        self.assertEqual(str(fetched.gcs_path), gcs_path)
        self.assertEqual(fetched.size, file_size)
        self.assertEqual(fetched.content_type, 'application/pdf')

        os.unlink(filename)

        return (other, teammate, contact, captain, super_admin, team,
                classroom, report_dict)

    def test_post_team_pdf(self):
        today_str = datetime.date.today().strftime(config.iso_date_format)
        filename = 'Team_filewhack.{}.pdf'.format(today_str)
        (
            other, teammate, contact, captain, super_admin, team, classroom,
            gcs_path, file_size
        ) = self.create_for_post(filename)

        response = self.testapp.post(
            '/api/reports',
            {'team_id': team.uid, 'filename': filename},
            upload_files=[('file', filename)],
            headers=self.login_headers(super_admin),
        )
        report_dict = json.loads(response.body)
        fetched = Report.get_by_id(report_dict['uid'])

        self.assertEqual(fetched.team_id, team.uid)
        self.assertEqual(fetched.classroom_id, None)
        self.assertEqual(fetched.filename, filename)
        self.assertEqual(str(fetched.gcs_path), gcs_path)
        self.assertEqual(fetched.size, file_size)
        self.assertEqual(fetched.content_type, 'application/pdf')

        os.unlink(filename)

        return (other, teammate, contact, captain, super_admin, team,
                classroom, report_dict)

    def test_post_class_dataset(self):
        today_str = datetime.date.today().strftime(config.iso_date_format)
        filename = 'Classroom_filewhack.{}.html'.format(today_str)
        dataset_id = 'Dataset_foo'
        template = 'template.html'
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()

        response = self.testapp.post_json(
            '/api/reports',
            {
                'filename': filename,
                'classroom_id': classroom.uid,
                'dataset_id': dataset_id,
                'template': template,
            },
            headers={'Authorization': 'Bearer ' + self.valid_jwt},
        )
        fetched = Report.get_by_id(json.loads(response.body)['uid'])

        self.assertEqual(fetched.team_id, team.uid)
        self.assertEqual(fetched.classroom_id, classroom.uid)
        self.assertEqual(fetched.filename, filename)
        self.assertEqual(fetched.dataset_id, dataset_id)
        self.assertEqual(fetched.template, template)

    def test_post_team_dataset(self):
        today_str = datetime.date.today().strftime(config.iso_date_format)
        filename = 'Team_filewhack.{}.html'.format(today_str)
        dataset_id = 'Dataset_foo'
        template = 'template.html'
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()

        response = self.testapp.post_json(
            '/api/reports',
            {
                'filename': filename,
                'team_id': team.uid,
                'dataset_id': dataset_id,
                'template': template,
            },
            headers={'Authorization': 'Bearer ' + self.valid_jwt},
        )
        fetched = Report.get_by_id(json.loads(response.body)['uid'])

        self.assertEqual(fetched.team_id, team.uid)
        self.assertIsNone(fetched.classroom_id)
        self.assertEqual(fetched.filename, filename)
        self.assertEqual(fetched.dataset_id, dataset_id)
        self.assertEqual(fetched.template, template)

    def test_post_preview_setting(self):
        for x in range(1, 4):
            Team.create(
                id='00{}'.format(x),
                captain_id='User_cap',
                program_id=self.program.uid,
            ).put()

        def body(x):
            return {
                'filename': 'file_00{}.html'.format(x),
                'team_id': 'Team_00{}'.format(x),
                'dataset_id': 'Dataset_00{}'.format(x),
                'template': 'template.html',
            }
        headers = {'Authorization': 'Bearer ' + self.valid_jwt}

        preview_rsp = self.testapp.post_json(
            '/api/reports',
            dict(body(1), preview=True),
            headers=headers
        )
        non_pre_rsp = self.testapp.post_json(
            '/api/reports',
            dict(body(2), preview=False),
            headers=headers
        )
        default_rsp = self.testapp.post_json(
            '/api/reports',
            body(3),
            headers=headers
        )

        preview_fetched = Report.get_by_id(json.loads(preview_rsp.body)['uid'])
        non_pre_fetched = Report.get_by_id(json.loads(non_pre_rsp.body)['uid'])
        default_fetched = Report.get_by_id(json.loads(default_rsp.body)['uid'])

        self.assertEqual(preview_fetched.preview, True)
        self.assertEqual(non_pre_fetched.preview, False)
        self.assertEqual(default_fetched.preview, True)

    def test_duplicate_post(self):
        (
            other, teammate, contact, captain, super_admin, team, classroom
        ) = self.create()
        today_str = datetime.date.today().strftime(config.iso_date_format)
        report_params = {
            'filename': 'Team_filewhack.{}.html'.format(today_str),
            'team_id': team.uid,
            'dataset_id': 'Dataset_first',
            'template': 'template.html',
        }

        response = self.testapp.post_json(
            '/api/reports',
            report_params,
            headers={'Authorization': 'Bearer ' + self.valid_jwt},
        )
        first_uid = json.loads(response.body)['uid']
        self.assertIsNotNone(Report.get_by_id(first_uid))

        # Post a second report with the same filename and team. This should
        # update the old report.
        report_params['dataset_id'] = 'Dataset_second'
        response = self.testapp.post_json(
            '/api/reports',
            report_params,
            headers={'Authorization': 'Bearer ' + self.valid_jwt},
        )
        second_uid = json.loads(response.body)['uid']
        self.assertEqual(first_uid, second_uid)
        self.assertEqual(Report.get_by_id(first_uid).dataset_id,
                         'Dataset_second')

    def assert_pdf_response(self, report_dict, response):
        self.assertEqual(
            response.headers['Content-Disposition'],
            'inline; filename={}'.format(report_dict['filename']),
        )
        self.assertEqual(
            response.headers['Content-Type'],
            'application/pdf',
        )
        self.assertEqual(len(response.body), report_dict['size'])

    def test_get_pdf_super_allowed(self):
        """Can get a report, even without a token, if you're a super."""
        (
            other, teammate, contact, captain, super_admin, team, classroom,
            report_dict
        ) = self.test_post_team_pdf()

        # No token in the query string gives 200.
        response = self.testapp.get(
            '/api/teams/{team_id}/reports/{filename}'.format(
                team_id=team.uid,
                filename=report_dict['filename'],
            ),
            headers=self.login_headers(super_admin),
        )

        self.assert_pdf_response(report_dict, response)

    def test_get_pdf_token_allowed(self):
        """You don't need to be logged in at all, if your token is right."""
        (
            other, teammate, contact, captain, super_admin, team, classroom,
            report_dict
        ) = self.test_post_team_pdf()

        # Put in a classroom report for the same team so we know we can
        # correctly select the team-level one.
        classReport = Report.create(
            team_id=team.uid,
            classroom_id=classroom.uid,
            filename='classroom.pdf',
            gcs_path='/mybucket/upload/classroom.pdf',
            size=1000000,
            content_type='application/pdf',
        )
        classReport.put()

        path = '/api/teams/{team_id}/reports/{filename}'.format(
            team_id=team.uid,
            filename=report_dict['filename'],
        )
        endpoint_str = util.get_endpoint_str(method='GET', path=path)
        jwt = jwt_helper.encode({'allowed_endpoints': [endpoint_str]}),
        url = util.set_query_parameters(path, token=jwt)

        response = self.testapp.get(url)  # asserts 200

        self.assert_pdf_response(report_dict, response)

    def test_put_forbidden(self):
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        for user in (other, teammate, contact, captain):
            self.testapp.put_json(
                '/api/reports/{}'.format(classReport1.uid),
                {'filename': 'bar.pdf'},
                headers=self.login_headers(user),
                status=403,
            )

    def test_delete_forbidden(self):
        """Only supers can delete reports."""
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        for user in (other, teammate, contact, captain):
            self.testapp.delete(
                '/api/reports/{}'.format(classReport1.uid),
                headers=self.login_headers(user),
                status=403,
            )

    def test_delete(self):
        (other, teammate, contact, captain, super_admin, team, classroom,
            classReport1, classReport2, teamReport) = self.create_reports()

        url = '/api/reports/{}'.format(classReport1.uid)
        headers = self.login_headers(super_admin)

        # Delete the report.
        self.testapp.delete(url, headers=headers, status=204)

        # Expect the report is gone from the db.
        self.assertIsNone(Report.get_by_id(classReport1.uid))

        # Api should show a 404.
        self.testapp.get(url, headers=headers, status=404)
        self.testapp.delete(url, headers=headers, status=404)

    def empty_report_params(self, report_date, uid):
        return {
            'dataset_id': None,
            'filename': '{}.html'.format(report_date),
            'issue_date': report_date,
            'notes': 'foo note; bar note',
            'id': uid,
            'template': 'empty',
        }

    def test_rserve_patch(self):
        """RServe can send may reports in a PATCH."""
        rserve_user = User.create(
            id='rserve', email='rserve@perts.net', user_type='super_admin',
        )
        rserve_user.put()

        report_date = datetime.date.today().strftime('%Y-%m-%d')

        def post(uid):
            return {
                'method': 'POST',
                'path': '/api/reports',
                'body': self.empty_report_params(report_date, uid),
            }

        self.testapp.patch_json(
            '/api/reports',
            [post('Org_foo'), post('Team_foo'), post('Class_foo')],
            headers=self.login_headers(rserve_user)
        )

        # Each call in the PATCH body creates a task to POST a report.
        tasks = self.taskqueue_stub.get_filtered_tasks()
        self.assertEqual(len(tasks), 3)

    def test_post_empty_report(self):
        """RServe posts "empty" reports to note why it hasn't produced a
        visible report. Test that the API accepts these for each kind of
        parent.
        """
        rserve_user = User.create(
            id='rserve', email='rserve@perts.net', user_type='super_admin',
        )
        rserve_user.put()

        org = Organization.create(
            name='Organization', captain_id='User_cap',
            program_id=self.program.uid
        )
        org.put()
        team = Team.create(
            name='Team Foo', captain_id='User_cap', organization_ids=[org.uid],
            program_id=self.program.uid,
        )
        team.put()
        classroom = Classroom.create(
            name='Class foo', team_id=team.uid, code='trout viper',
            contact_id='User_contact'
        )
        classroom.put()

        url = '/api/reports'
        report_date = datetime.date.today().strftime('%Y-%m-%d')

        self.testapp.post_json(
            url,
            dict(self.empty_report_params(report_date, org.uid),
                 organization_id=org.uid),
            headers=self.login_headers(rserve_user),
        )

        self.testapp.post_json(
            url,
            dict(self.empty_report_params(report_date, team.uid),
                 team_id=team.uid),
            headers=self.login_headers(rserve_user),
        )

        self.testapp.post_json(
            url,
            dict(self.empty_report_params(report_date, classroom.uid),
                 team_id=team.uid,
                 classroom_id=classroom.uid),
            headers=self.login_headers(rserve_user),
        )

        reports = Report.get()
        self.assertEqual(len(reports), 3)
        self.assertEqual(all(r.template == 'empty' for r in reports), True)
