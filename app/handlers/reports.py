import cloudstorage as gcs
import hashlib
import logging
import os

import jwt_helper
import util
from gae_handlers import ApiHandler, RestHandler
from model import (
    Classroom,
    Network,
    Organization,
    Report,
    SqlModel,
    Team,
)
from permission import has_captain_permission, has_contact_permission, owns


class Reports(RestHandler):
    model = Report
    requires_auth = False  # Custom implentation; accepts rsa-based jwts also

    def patch(self):
        # Allow RServe to call this endpoint, then fall back on regular auth.
        user, error = self.authenticate_rserve()
        if not user:
            user = self.get_current_user()
            error = ''

        # Replaces function of `requires_auth = True`.
        if user.user_type == 'public':
            return self.http_unauthorized()

        if not user.super_admin:
            return self.http_forbidden()

        super(Reports, self).patch()

    def post(self):
        """Save references to reports, and perhaps the report file itself.

        Has two modes: accept a file, in which case the file is saved to GCS, or
        a dataset id. In both cases a Report is inserted referencing the
        file/dataset.

        Either `team_id` or `classroom_id` must be provided. If team_id, then
        the report's classroom_id is empty (these are "team-level" reports). If
        classroom_id, the corresponding team_id is looked up (these are
        "classroom-level" reports).
        """

        # Allow RServe to call this endpoint, then fall back on regular auth.
        user, error = self.authenticate_rserve()
        if not user:
            user = self.get_current_user()
            error = ''

        # Replaces function of `requires_auth = True`.
        if user.user_type == 'public':
            return self.http_unauthorized()

        if not user.super_admin:
            return self.http_forbidden()

        org_id = self.get_param('organization_id', str, None)
        team_id = self.get_param('team_id', str, None)
        classroom_id = self.get_param('classroom_id', str, None)
        params = self.get_params({
            'dataset_id': str,
            'filename': unicode,
            'issue_date': str,
            'notes': unicode,
            'preview': bool,
            'template': str,
        })

        # Lookup related objects.
        classroom = None
        if classroom_id:
            classroom = Classroom.get_by_id(classroom_id)
            if not classroom:
                return self.http_bad_request("Classroom not found: {}"
                                             .format(classroom_id))
            team_id = classroom.team_id

        team = None
        if team_id:
            # May be set for team reports, or via lookup for class reports.
            team = Team.get_by_id(team_id)
            if not team:
                return self.http_bad_request("Team not found: {}"
                                             .format(team_id))

        org = None
        if org_id:
            org = Organization.get_by_id(org_id)
            if not org:
                return self.http_bad_request("Organization not found: {}"
                                             .format(org_id))

        content_type = self.request.headers['Content-Type']
        is_form = 'multipart/form-data' in content_type
        is_json = 'application/json' in content_type

        if is_form:
            report = self.save_file(
                params['filename'],
                self.request.POST['file'],
                org_id,
                team_id,
                classroom_id,
            )
        elif is_json:
            kwargs = {
                'classroom_id': classroom_id,
                'dataset_id': params['dataset_id'],
                'filename': params['filename'],
                'issue_date': params.get('issue_date', None),
                'notes': params.get('notes', None),
                'organization_id': org_id,
                'team_id': team_id,
                'template': params['template'],
            }

            # Some params we may want to avoid including at all, so that if
            # they're absent they'll take the default value defined in the db.
            if params.get('preview', None) is not None:
                kwargs['preview'] = params['preview']

            report = Report.create(**kwargs)
        else:
            return self.http_bad_request(
                "Only supported content types are 1) multipart/form-data for "
                "uploading files and 2) application/json for datasets. Got {}"
                .format(self.request.headers['Content-Type'])
            )

        saved_report = Report.put_for_index(report, 'parent-file')

        self.write(saved_report)

    def authenticate_rserve(self):
        """Specialized authentication and log-in for requests from RServe.

        RServe is designed to echo an rsa-signed jwt back to Neptune. A dedicated
        super admin user account should be in the jwt. We log in that user so
        downstream handler code will execute with full permissions.

        Returns (rserve_user, error_msg).
        """
        payload, error = jwt_helper.decode_rsa(self.get_jwt())

        if not payload or error:
            return (None, error)

        # Make sure the payload meets expectations.
        if not all(key in payload for key in ('user_id', 'email', 'user_type')):
            raise Exception("Authorization JWT must include user_id, email, and "
                            "user_type.")

        # Retrieve or create the user, who should be the rserve user, a super
        # admin.
        rserve_user = self.sync_user_with_token(payload)

        # Replace the rsa-based token with the normal symmetric one which the rest
        # of our code will recognize as this user being logged in.
        self.log_in(rserve_user)

        return (rserve_user, None)

    def save_file(self, filename, field_storage, org_id=None, team_id=None,
                  classroom_id=None):
        """GCS files are saved by their md5 hash, so uploading the same file
        many times has no effect (other than io). Uploading a different file to
        the same classroom and filename changes the reference on the report
        object in the db, but doesn't delete previous uploads in cloud storage.
        A history of uploads for a given report can be found by searching the
        upload bucket for files with the header 'x-goog-meta-task-id:[classroom
        uid]'.

        Filenames as uploaded are preserved:

        * in the Content-Disposition header of the GCS file
        * in the report object, which has properties gcs_path, filename,
          content_type

        To avoid file names getting out of sync, only the one in the report
        object is actually used.
        """
        # Which variant of report, team- or classroom-level.
        meta_headers = {}
        if org_id:
            meta_headers['x-goog-meta-organization-id'] = org_id
        if team_id:
            meta_headers['x-goog-meta-team-id'] = team_id
        if classroom_id:
            meta_headers['x-goog-meta-classroom-id'] = classroom_id

        if len(meta_headers) == 0:
            return self.http_bad_request("Missing ids.")

        # FieldStorageClass object has potentially useful properties:
        # file: cStringIO.StringO object
        # headers: rfc822.Message instance
        # type: str, MIME type, e.g. 'application/pdf'
        # filename: str, file name as uploaded

        file_contents = field_storage.file.read()
        file_hash = hashlib.md5(file_contents).hexdigest()

        field_storage.file.seek(0, os.SEEK_END)
        file_size = field_storage.file.tell()

        content_type = field_storage.type

        gcs_path = '/{}{}/{}'.format(
            util.get_upload_bucket(),
            os.environ['GCS_UPLOAD_PREFIX'],
            file_hash,
        )

        open_kwargs = {
            'content_type': content_type,
            # These will be headers on the stored file.
            'options': dict(
                {
                    # Not actually used, but seems smart to keep track of.
                    'Content-Disposition': 'attachment; filename=' + filename,
                },
                # Theoretically allows figuring out an attachment history for
                # a given classroom.
                **meta_headers
            ),
            'retry_params': gcs.RetryParams(backoff_factor=1.1),
        }

        with gcs.open(gcs_path, 'w', **open_kwargs) as gcs_file:
            gcs_file.write(file_contents)

        report = Report.create(
            organization_id=org_id,
            team_id=team_id,
            classroom_id=classroom_id,
            filename=filename,
            gcs_path=gcs_path,
            size=file_size,
            content_type=content_type,
        )
        return report

    def put(self, id=None):
        # Replaces function of `requires_auth = True`.
        user = self.get_current_user()
        if user.user_type == 'public':
            return self.http_unauthorized()

        # Overrides ownership, only supers may update reports.
        if id is None:
            # Collection has no PUT
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD, POST'
        elif Report.get_by_id(id):
            if self.get_current_user().super_admin:
                super(Reports, self).put(id)
            else:
                self.error(403)
        else:
            self.error(404)

    def delete(self, id=None):
        # Replaces function of `requires_auth = True`.
        user = self.get_current_user()
        if user.user_type == 'public':
            return self.http_unauthorized()

        # Overrides ownership, only supers may delete reports.
        if id is None:
            # Collection has no DELETE
            self.error(405)
            self.response.headers['Allow'] = 'GET, HEAD, POST'
        elif Report.get_by_id(id):
            if self.get_current_user().super_admin:
                super(Reports, self).delete(id)
            else:
                self.error(403)
        else:
            self.error(404)


class ParentReports(ApiHandler):
    def get(self, parent_type, rel_id):
        if parent_type == 'networks':
            self.get_network_reports(rel_id)
        elif parent_type == 'organizations':
            self.get_organization_reports(rel_id)
        elif parent_type == 'teams':
            self.get_team_reports(rel_id)
        else:
            self.http_not_found()

    def get_network_reports(self, network_id):
        user = self.get_current_user()
        net = Network.get_by_id(network_id)

        if not net:
            return self.http_not_found()

        if not owns(user, net):
            return self.http_forbidden("Only net admins can list reports.")

        # Limit access to preview reports, super admin only.
        show_preview_reports = True if user.super_admin else False
        all_reports = Report.get_for_network(net.uid, show_preview_reports)

        # Add a custom link for users to access each report.
        self.write([
            dict(r.to_client_dict(), link=self.report_link(r))
            for r in all_reports
        ])

    def get_organization_reports(self, organization_id):
        user = self.get_current_user()
        org = Organization.get_by_id(organization_id)

        if not org:
            return self.http_not_found()

        if not owns(user, org):
            return self.http_forbidden("Only org admins can list reports.")

        # Limit access to preview reports, super admin only.
        show_preview_reports = True if user.super_admin else False
        all_reports = Report.get_for_organization(org.uid, show_preview_reports)

        # Add a custom link for users to access each report.
        self.write([
            dict(r.to_client_dict(), link=self.report_link(r))
            for r in all_reports
        ])

    def get_team_reports(self, team_id):
        user = self.get_current_user()
        team = Team.get_by_id(team_id)

        if not team:
            return self.http_not_found()

        if not owns(user, team) and not has_captain_permission(user, team):
            return self.http_forbidden("Only team members can list reports.")

        # Limit access to preview reports, super admin only.
        show_preview_reports = True if user.super_admin else False
        # Returns both team- and class-level reports.
        all_reports = Report.get_for_team(team.uid, show_preview_reports)

        # Any team member can see the team reports...
        allowed_reports = [r for r in all_reports if not r.classroom_id]

        # ...but limit access to classroom reports.
        classroom_reports = [r for r in all_reports if r.classroom_id]
        classroom_ids = [r.classroom_id for r in classroom_reports]
        classrooms = {c.uid: c for c in Classroom.get_by_id(classroom_ids)}

        for report in classroom_reports:
            if has_contact_permission(user, classrooms[report.classroom_id]):
                allowed_reports.append(report)

        # Add a custom link for users to access each report.
        self.write([
            dict(r.to_client_dict(), link=self.report_link(r))
            for r in allowed_reports
        ])

    def report_link(self, report):
        parent_kind = SqlModel.get_url_kind(report.parent_id)
        short_id = SqlModel.convert_uid(report.parent_id)

        if report.gcs_path:
            platform = 'triton'
            prefix = ''
            view_path = '/api/{parent_kind}/{id}/reports/{filename}'.format(
                parent_kind=parent_kind,
                id=short_id,
                filename=report.filename,
            )
        elif report.dataset_id:
            platform = 'neptune'
            prefix = '{protocol}://{domain}'.format(
                protocol='http' if util.is_localhost() else 'https',
                domain=('localhost:8888' if util.is_localhost()
                        else os.environ['NEPTUNE_DOMAIN']),
            )
            view_path = '/datasets/{ds_id}/{template}/{filename}'.format(
                ds_id=SqlModel.convert_uid(report.dataset_id),  # short form
                template=report.template,
                filename=report.filename,
            )

        # Permit report clients to query some data about participation.
        parent_path = '/api/{parent_kind}/{id}'.format(
            parent_kind=parent_kind, id=short_id)
        data_path = '/api/{parent_kind}/{id}/report_data'.format(
            parent_kind=parent_kind, id=short_id)

        link_jwt = jwt_helper.encode(
            {'allowed_endpoints': [
                self.get_endpoint_str(platform=platform, path=view_path),
                self.get_endpoint_str(platform='triton', path=parent_path),
                self.get_endpoint_str(platform='triton', path=data_path),
            ]},
            expiration_minutes=(30 * 24 * 60),  # thirty days
        )

        return util.set_query_parameters(prefix + view_path, token=link_jwt)


class ReportPdf(ApiHandler):
    model = Report
    requires_auth = False  # we'll use a token in the query string instead

    def get(self, parent_type, rel_id, filename):
        # Always require a jwt that specifies this path/report. This allows
        # shareable, expiring links.
        if not self.get_current_user().super_admin:
            params = self.get_params({'token': str})
            token = params.get('token', None)
            payload, error = jwt_helper.decode(token)
            if error == jwt_helper.EXPIRED:
                return self.http_forbidden("This link has expired.")
            elif not payload or error:
                return self.http_bad_request("Missing or invalid token.")

            allowed_endpoints = payload.get('allowed_endpoints', [])
            if self.get_endpoint_str() not in allowed_endpoints:
                return self.http_forbidden("Token does not allow endpoint.")

        if parent_type == 'organizations':
            parent_id = Organization.get_long_uid(rel_id),
        elif parent_type == 'teams':
            parent_id = Team.get_long_uid(rel_id),
        elif parent_type == 'classrooms':
            parent_id = Classroom.get_long_uid(rel_id),
        else:
            raise Exception("Unrecognized parent type: {}".format(parent_type))
        results = Report.get(parent_id=parent_id, filename=filename)

        if len(results) == 0:
            return self.http_not_found()
        report = results[0]

        # We intentionally don't check permissions or ownership any further
        # here, because reports are shared by link, and we already checked for
        # a jwt in the query string.

        self.response.headers.update({
            'Content-Disposition': 'inline; filename={}'.format(
                report.filename),
            # Unicode not allowed in headers.
            'Content-Type': str(report.content_type),
        })
        try:
            with gcs.open(report.gcs_path, 'r') as gcs_file:
                self.response.write(gcs_file.read())
        except gcs.NotFoundError:
            logging.error("Couldn't find a gcs file for report {}"
                          .format(report.to_dict()))
            self.http_not_found()

    def post(self):
        self.http_method_not_allowed('GET, HEAD')

    def put(self, *args, **kwargs):
        self.http_method_not_allowed('GET, HEAD')

    def delete(self, *args, **kwargs):
        self.http_method_not_allowed('GET, HEAD')
