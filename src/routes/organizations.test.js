import toParams from 'utils/toParams';
import * as routes from 'routes';

// Organizations
describe('routes', () => {
  describe('organization', () => {
    describe('toNewOrganization', () => {
      it('should return route config when no params provided', () => {
        const expected = '/home/:programLabel/organizations/new';
        const actual = routes.toNewOrganization();

        expect(actual).toEqual(expected);
      });

      it('should return route link when params provided', () => {
        // this function takes no parameters
      });
    });

    describe('toOrganizationDetails', () => {
      it('should return route config when no params provided', () => {
        const expected = '/organizations/:organizationId';
        const actual = routes.toOrganizationDetails();

        expect(actual).toEqual(expected);
      });

      it('should return route link when params provided', () => {
        const organizationId = 'Organization_001';
        const expected = `/organizations/${toParams(organizationId)}`;
        const actual = routes.toOrganizationDetails(organizationId);

        expect(actual).toEqual(expected);
      });
    });

    describe('toOrganizationTeams', () => {
      it('should return route config when no params provided', () => {
        const expected = '/organizations/:organizationId/teams';

        expect(routes.toOrganizationTeams()).toEqual(expected);
        expect(routes.toOrganization()).toEqual(expected);
      });

      it('should return route link when params provided', () => {
        const organizationId = 'Organization_001';
        const expected = `/organizations/${toParams(organizationId)}/teams`;

        expect(routes.toOrganizationTeams(organizationId)).toEqual(expected);
        expect(routes.toOrganization(organizationId)).toEqual(expected);
      });
    });

    describe('toOrganizationClassrooms', () => {
      it('should return route config when no params provided', () => {
        const expected = '/organizations/:organizationId/classrooms';
        const actual = routes.toOrganizationClassrooms();

        expect(actual).toEqual(expected);
      });

      it('should return route link when params provided', () => {
        const organizationId = 'Organization_001';
        const expected = `/organizations/${toParams(
          organizationId,
        )}/classrooms`;
        const actual = routes.toOrganizationClassrooms(organizationId);

        expect(actual).toEqual(expected);
      });
    });

    describe('toOrganizationUsers', () => {
      it('should return route config when no params provided', () => {
        const expected = '/organizations/:organizationId/users';
        const actual = routes.toOrganizationUsers();

        expect(actual).toEqual(expected);
      });

      it('should return route link when params provided', () => {
        const organizationId = 'Organization_001';
        const expected = `/organizations/${toParams(organizationId)}/users`;
        const actual = routes.toOrganizationUsers(organizationId);

        expect(actual).toEqual(expected);
      });
    });

    describe('toOrganizationInstructions', () => {
      it('should return route config when no params provided', () => {
        const expected = '/organizations/:organizationId/invite';
        const actual = routes.toOrganizationInstructions();

        expect(actual).toEqual(expected);
      });

      it('should return route link when params provided', () => {
        const organizationId = 'Organization_001';
        const expected = `/organizations/${toParams(organizationId)}/invite`;
        const actual = routes.toOrganizationInstructions(organizationId);

        expect(actual).toEqual(expected);
      });
    });
  });
});
