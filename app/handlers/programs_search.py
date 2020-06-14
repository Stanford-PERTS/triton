import logging

from gae_handlers import RestHandler
from model import Classroom, Organization, Program, Team, User
from permission import owns


class ProgramsSearch(RestHandler):
    model = Program
    requires_auth = True

    def get(self, program_id_or_label):
        user = self.get_current_user()
        if not user.super_admin:
            return self.http_forbidden()

        program = Program.get_by_id(program_id_or_label)
        if not program:
            program = Program.get_by_label(program_id_or_label)
        if not program:
            return self.http_not_found()
            
        search_str = self.get_param('q', unicode, None)

        if not search_str:
            return self.write([])

        if search_str.startswith('user:'):
            search_str = search_str[5:]
            return self.write(self.get_membership(search_str, program.uid))

        # @todo: classrooms don't have team r
        orgs = Organization.query_by_name(search_str, program.uid)
        teams = Team.query_by_name(search_str, program.uid)
        classrooms = Classroom.query_by_name(search_str, program.uid)
        users = User.query_by_name_or_email(search_str)

        self.write({
            'organizations': [e.to_client_dict() for e in orgs],
            'teams': [e.to_client_dict() for e in teams],
            'classrooms': [e.to_client_dict() for e in classrooms],
            'users': [e.to_client_dict() for e in users],
        })

    def get_membership(self, email, program_id):
        user = User.get_by_auth('email', email)
        orgs = Organization.query_by_user(user, program_id)
        teams = Team.query_by_user(user, program_id)
        classrooms = Classroom.query_by_contact(user, program_id)

        return {
            'organizations': [e.to_client_dict() for e in orgs],
            'teams': [e.to_client_dict() for e in teams],
            'classrooms': [e.to_client_dict() for e in classrooms],
            'users': [user.to_client_dict()],
        }


    def post(self):
        self.not_allowed()

    def put(self):
        self.not_allowed()

    def delete(self, id=None):
        self.not_allowed()

    def not_allowed(self):
        self.error(405)
        self.response.headers['Allow'] = 'GET, HEAD'
