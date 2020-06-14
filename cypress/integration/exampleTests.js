/* global cy */
import mocks from 'mocks';
import * as routes from 'routes';
import { debug } from 'util';

describe('Example Tests', () => {
  const program = mocks.createProgram();
  const user = mocks.createUser({ verified: true });
  const team = mocks.createTeam({
    name: 'Team Viper',
    program_id: program.uid,
  });
  mocks.setUserCaptain(user, team);
  const survey = mocks.createSurvey({ team_id: team.uid });

  beforeEach(() => {
    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    cy.route({
      method: 'GET',
      url: '**/api/teams/*',
      headers: mocks.cy.mockNeptuneResponseHeaders(user.uid, user.email),
      response: team,
    });
    cy.route(`**/api/programs`, [program]);
    cy.route(`**/api/teams/*/classrooms`, []);
    cy.route(`**/api/teams/*/cycles`, [{}, {}, {}]);
    cy.route(`**/api/teams/*/responses`, []);
    cy.route(`**/api/teams/*/users`, [user]).as('users');
    cy.route(`**/api/teams/*/survey`, survey);
    cy.route({
      method: 'PUT',
      url: '**/api/users/*',
      response: user,
    });
    cy.route(`**/api/users/*/responses`, []);
    cy.route(`**/api/users/*/organizations`, []);
    cy.route(`**/api/users/*/teams`, [team]);
  });

  describe('custom store command', () => {
    it('should allow redux assertions', () => {
      cy.visit('/');

      cy.wait('@users');

      // Using the custom `store` command, we can look into the store in our
      // Cypress tests to make assertions.
      cy.store('entities.users.byId')
        .should('have.property', user.uid)
        .should('deep.equal', user);
    });
  });

  xdescribe('xhr requests', () => {
    it('should allow xhr assertions', () => {
      const userNewName = 'User New Name';
      const updatedUser = {
        ...user,
        name: userNewName,
      };

      cy.route({
        method: 'PUT',
        url: '**/api/users/*',
        response: updatedUser,
      }).as('updateUser');

      cy.visit(routes.toUserDetails(user.uid));

      cy.get('#name-field')
        .clear()
        .type(userNewName);

      cy.get('[data-test=submit]').click();

      cy.wait('@updateUser').then(xhr => {
        // Assert that the updated user PUT request went out.
        // Since we are mocking server responses, this seems to be the more
        // useful test, but I'm including the response assertions below as
        // reference in case we ever need it.
        cy.wrap(xhr.request.body).should('deep.equal', updatedUser);

        // Assert that the update user PUT response was successful.
        cy.wrap(xhr.status).should('equal', 200);
        cy.wrap(xhr.response.body).should('deep.equal', updatedUser);
      });
    });
  });
});
