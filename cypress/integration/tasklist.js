/* global cy */
import * as routes from 'routes';
import mocks from 'mocks';
import { formValuesToBody } from 'state/responses/helpers';

describe('Program Tasklist', () => {
  describe('Task', () => {
    describe('type="inlineModule"', () => {
      it('saves response', () => {
        const program = mocks.createProgram({ label: 'ep19' });
        const user = mocks.createUser();
        const team = mocks.createTeam({
          name: 'Team Viper',
          program_id: program.uid,
        });
        mocks.setUserCaptain(user, team);
        const survey = mocks.createSurvey({ team_id: team.uid });

        const responseType = 'User';
        const stepType = 'single';
        const parentLabel = 'orientation';
        const moduleLabel = 'EPImplementationAgreement';

        const response = {
          uid: 'Response_001',
          short_uid: '001',
          user_id: user.uid,
          team_id: team.uid,
          type: responseType,
          parent_id: parentLabel,
          module_label: moduleLabel,
          body: {
            ...formValuesToBody({ signature: user.name }),
          },
          progress: 100,
        };

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
        cy.route(`**/api/teams/*/users`, [user]);
        cy.route(`**/api/teams/*/survey`, survey);
        cy.route({
          method: 'PUT',
          url: '**/api/users/*',
          response: user,
        });
        cy.route(`**/api/users/*/responses`, []);
        cy.route(`**/api/users/*/organizations`, []);
        cy.route(`**/api/users/*/teams`, [team]);

        // A response object is required to trigger the submit-succeeded state.
        cy.route({
          method: 'POST',
          url: '**/api/responses',
          response,
        });

        const url = routes.toProgramStep(team.uid, stepType, parentLabel);
        cy.visit(url);

        cy.get('input[name=signature]')
          .should('be.visible')
          .type(user.name);

        cy.get('[data-test=submit]')
          .should('not.be.disabled')
          .click();

        // Assert that the success feedback is displayed.
        cy.get('[data-test=submitFailed]').should('not.be.visible');
        cy.get('[data-test=submitSucceeded]').should('be.visible');
      });
    });
  });
});
