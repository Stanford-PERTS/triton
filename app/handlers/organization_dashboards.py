import logging

from gae_handlers import ApiHandler
from model import Classroom, Cycle, Organization, Response, Team, User
from permission import owns

class OrganizationDashboards(ApiHandler):
    def get(self, org_id):
        user = self.get_current_user()
        org = Organization.get_by_id(org_id)

        if not org:
            return self.http_not_found()

        if not owns(user, org):
            return self.http_forbidden()

        teams = Team.query_by_organization(org_id)
        team_ids = [t.uid for t in teams]
        classrooms = Classroom.query_by_teams(team_ids)
        cycles = Cycle.query_by_teams(team_ids)
        responses = Response.get_for_teams(user, team_ids)
        users = User.query_by_team(team_ids)

        self.write({
            'classrooms': [e.to_client_dict() for e in classrooms],
            'cycles': [e.to_client_dict() for e in cycles],
            'teams': [e.to_client_dict() for e in teams],
            'responses': [e.to_client_dict() for e in responses],
            'users': [e.to_client_dict() for e in users],
        })
