/* global cy, Cypress */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('store', (stateName = '') => {
  // We're overriding the default logger since it will log out all the steps in
  // our command and we only want to see the final result.
  // https://docs.cypress.io/api/cypress-api/cypress-log.html#Syntax
  const log = Cypress.log({ name: 'store' });

  const customLog = state => {
    log.set({
      // displayed in the command log
      message: JSON.stringify(state),
      // console output when you click the STORE command (in the command log)
      consoleProps: () => ({ state }),
    });

    return state;
  };

  return (
    cy
      // Disable the default logger
      .window({ log: false })
      // Grab the store's state that is being made available on window by
      // src/state/store.js
      .then($window => $window.store.getState())
      .then(state => {
        if (stateName.length > 0) {
          return cy
            .wrap(state, { log: false })
            .its(stateName)
            .then(customLog);
        }

        return cy.wrap(state, { log: false }).then(customLog);
      })
  );
});
