/* global cy */
import * as routes from 'routes';
import mocks from 'mocks';

describe('UserWelcomeModal for EP', () => {
  const program = mocks.createProgram({ label: 'ep19' });

  it('should ask for name when no name set', () => {
    const user = mocks.createUser({
      uid: 'User_M0cK3d123',
      name: null, // no name set
      email: 'viper@perts.net',
      consent: true,
    });

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    cy.route(`/api/programs`, [program]);
    cy.route(`/api/users/${user.uid}/teams**`, []);
    cy.route(`/api/users/${user.uid}/organizations**`, []);
    cy.route({
      method: 'PUT',
      url: `/api/users/${user.uid}`,
      response: user,
    });

    cy.visit(routes.toHome(program.label));
    cy.get('input[id=name-field]').type('Mister Viper');
    cy.get('button[data-test=next]').click();
    cy.get('.UserWelcomeFormName').should('have.length', 0);
  });

  it('should ask for consent when no consent set', () => {
    const user = mocks.createUser({
      uid: 'User_M0cK3d123',
      name: 'Mister Viper',
      email: 'viper@perts.net',
      consent: null, // no consent set
    });

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    cy.route(`/api/programs`, [program]);
    cy.route(`/api/users/${user.uid}/teams**`, []);
    cy.route(`/api/users/${user.uid}/organizations**`, []);
    cy.route({
      method: 'PUT',
      url: `/api/users/${user.uid}`,
      response: user,
    });

    cy.visit(routes.toHome(program.label));
    cy.get('input[id=noConsent]').click();
    cy.get('button[data-test=submit]').click();
    cy.get('.UserWelcomeFormConsent').should('have.length', 0);
  });

  it('should display tutorial, when not previously dismissed', () => {
    // Note: By default, Cypress clears out localStorage between tests, so the
    // dismissed key that we set should start out missing.
    const user = mocks.createUser({
      uid: 'User_M0cK3d123',
      name: 'Mister Viper',
      email: 'viper@perts.net',
      consent: false,
    });

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    cy.route(`/api/programs`, [program]);
    cy.route(`/api/users/${user.uid}/teams**`, []);
    cy.route(`/api/users/${user.uid}/organizations**`, []);
    cy.route({
      method: 'PUT',
      url: `/api/users/${user.uid}`,
      response: user,
    });

    cy.visit(routes.toHome(program.label));
    // proves there's a dismiss button, that is clickable
    cy.get('button[data-test=dismiss]').click();
    // proves that clicking the dismiss button hides the modal
    cy.get('.UserWelcomeModal').should('have.length', 0);
    cy.get('.UserWelcomeTutorial').should('have.length', 0);
  });
});
