/* global cy */

describe('Home screen', () => {
  it('loads', () => {
    cy.visit('/');
    cy.get('.LaunchPage').should('be.visible');
  });
});
