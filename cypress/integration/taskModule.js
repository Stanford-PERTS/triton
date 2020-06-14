/* global cy */
import * as routes from 'routes';
import mocks from 'mocks';
import forEach from 'lodash/forEach';
import moment from 'moment/moment';
import { formValuesToBody } from 'state/responses/helpers';

afterEach(() => {
  cy.window().then(win => {
    win.location.href = 'about:blank';
  });
});

describe('TaskModule', () => {
  // Since we're reusing a bit of code between modules that utilize Pages and
  // modules that don't, we want to make sure we don't break the pageless
  // functionality.
  describe('modules without pages', () => {
    const program = mocks.createProgram({
      label: 'demo',
      name: 'Demo Program',
    });
    const user = mocks.createUser();
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
    });

    const taskStepType = 'single';
    const taskParentLabel = 'introduction';
    const taskModuleLabel = 'DemoSinglePageModule';
    const taskResponseType = 'User';

    const formResponses = {
      signature: user.name,
      supervisor_info: 'The Boss',
      // TODO figure out a pattern for handling text and checkboxes all in one
      // supervisor_agreement: 'yes',
    };

    const response = {
      uid: 'Response_001',
      short_uid: '001',
      user_id: user.uid,
      team_id: team.uid,
      type: taskResponseType,
      parent_id: taskParentLabel,
      module_label: taskModuleLabel,
      body: {
        ...formValuesToBody(formResponses),
        ...formValuesToBody({ supervisor_agreement: 'yes' }),
        ...formValuesToBody({ is_captain: true }),
      },
    };

    it('should submit a new response', () => {
      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Assert that previous navigation is not displayed.
      cy.get('[data-test=prev]').should('not.be.visible');
      // Assert that submit button does exist and that it starts disabled.
      cy.get('[data-test=submit]')
        .should('be.visible')
        .should('be.disabled');

      // Assert that each field starts out empty (no existing response)
      // and that it can be filled out with a value.
      forEach(formResponses, (value, inputName) => {
        const inputField = cy.get(`input[name=${inputName}]`);
        inputField.should('have.value', '').type(value);
      });

      // Assert that the radio starts out empty
      cy.get(`input[name=supervisor_agreement]`).should(
        'not.have.attr',
        'checked',
      );

      // Assert that it can be checked.
      cy.get(`input[name=supervisor_agreement]`).check('yes');

      // Assert that the submit button is now enabled and click to submit.
      cy.route({
        method: 'POST',
        url: '**/api/responses',
        response,
      });

      cy.get('[data-test=submit]')
        .should('not.be.disabled')
        .click();

      // Assert that the success feedback is displayed.
      cy.get('[data-test=submitFailed]').should('not.be.visible');
      cy.get('[data-test=submitSucceeded]').should('be.visible');
    });

    it('should display existing response, allow user to edit', () => {
      cy.route(`**/api/teams/*/responses`, [response]);
      cy.route(`**/api/users/*/responses`, [response]);

      const supervisor_info = 'The BEST Boss';

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Assert that submit button does exist and that it starts disabled.
      cy.get('[data-test=submit]').should('be.visible');

      // Assert that we can edit.
      cy.get('input[name=signature]')
        .clear()
        .type('The Boss');

      cy.get('input[name=supervisor_info]')
        .clear()
        .type(supervisor_info);

      cy.get('input[name=supervisor_agreement][value=yes]').click();

      // Assert that we can submit.
      cy.route({
        method: 'PUT',
        url: '**/api/responses/*',
        response: {
          ...response,
          body: {
            ...response.body,
            supervisor_info,
          },
        },
      });
      cy.get('[data-test=submit]')
        .should('not.be.disabled')
        .click();

      // Assert that the success feedback is displayed.
      cy.get('[data-test=submitFailed]').should('not.be.visible');
      cy.get('[data-test=submitSucceeded]').should('be.visible');
    });

    it('handles conflicts if user chooses cancel', () => {
      cy.route(`**/api/teams/*/responses`, [response]);
      cy.route(`**/api/users/*/responses`, [response]);

      // Simulate a conflict.
      cy.route({
        method: 'PUT',
        url: '**/api/responses/*',
        response: 'conflict',
        status: 409,
      });

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Dirty the form, try to submit, choose cancel.
      cy.get('[name=supervisor_info]').type('dirty form');
      cy.get('[data-test=submit]').click();
      cy.get('[data-test=conflict-cancel-button').click();

      // Failure message should be visible, and navigation should be disabled.
      cy.get('[data-test=conflict-cancel-button').should('not.be.visible');
      cy.get('[data-test=submitFailed').should('be.visible');
      cy.get('[data-test=submit]').should('be.disabled');
    });

    it('handles conflicts if user chooses to save/override', () => {
      cy.route(`**/api/teams/*/responses`, [response]);
      cy.route(`**/api/users/*/responses`, [response]);

      // Simulate a conflict.
      cy.route({
        method: 'PUT',
        url: `**/api/responses/${response.uid}*`,
        response: 'conflict',
        status: 409,
      });
      // But allow it to be forced.
      cy.route({
        method: 'PUT',
        url: `**/api/responses/${response.uid}?force=true`,
        response: { ...response, progress: 100 },
      });

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Dirty the form, try to submit, choose cancel.
      cy.get('[name=supervisor_info]').type('dirty form');
      cy.get('[data-test=submit]').click();
      cy.get('[data-test=conflict-override-button]').click();

      // Failure message should be visible, and navigation should be disabled.
      cy.get('[data-test=conflict-override-button]').should('not.be.visible');
      cy.get('[data-test=submitFailed').should('not.be.visible');
      // CAM thinks there's a problem here with the form becoming dirty again.
      // cy.get('[data-test=submit]').should('be.disabled');
    });
  });

  describe('modules with pages', () => {
    const program = mocks.createProgram({
      label: 'demo',
      name: 'Demo Program',
    });
    const user = mocks.createUser();
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
    });

    // These tests assume that we have the ExampleSurvey module available and
    // that it is four pages long. If this test module is ever altered, then the
    // following variables might also need updating.
    const taskStepType = 'single';
    const taskParentLabel = 'introduction';
    const taskModuleLabel = 'ExampleSurvey';
    const firstPage = 1;
    const totalPages = 5;

    const modified = moment()
      .utc()
      .format();

    const responsesOnFirstPage = {
      foo11: { value: user.name, modified },
      foo12: { value: 'Lorem ipsum random text.', modified },
    };

    const response = {
      uid: 'Response_001',
      short_uid: '001',
      type: 'User',
      user_id: user.uid,
      team_id: team.uid,
      parent_id: taskParentLabel,
      module_label: taskModuleLabel,
      progress: 25,
      page: firstPage,
      body: responsesOnFirstPage,
    };

    it('should submit new response', () => {
      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Assert that we have been redirected to the first page of they survey.
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          firstPage,
          totalPages,
        ),
      );

      // Assert that the previous button is disabled on the first page.
      cy.get('[data-test=prev]').should('be.disabled');

      // Assert that the next button is currently disabled.
      // Note: The ExampleSurvey has validation rules that require the two
      // input fields on the first page to be filled. If this test module is
      // ever altered, then the following might also need updating.
      cy.get('[data-test=submit]').should('be.disabled');

      // Assert that each field starts out empty (no existing response)
      // and that it can be filled out with a value.
      forEach(responsesOnFirstPage, (compoundValue, inputName) => {
        const inputField = cy.get(`input[name=${inputName}]`);
        inputField.should('have.value', '').type(compoundValue.value);
      });

      // Assert that each checkbox starts out unchecked (no existing response)
      cy.get('input[type=checkbox]').should('not.have.attr', 'checked');

      // And that the checkboxes can be checked.
      cy.get('input[type=checkbox]').check([
        'make-a-difference',
        'inspire-others',
      ]);

      cy.route({
        method: 'POST',
        url: '**/api/responses',
        response,
      });

      // Assert that we can click the next button.
      cy.get('[data-test=submit]').click();

      // Assert that we don't receive an error message.
      cy.get('[data-test=submitFailed]').should('not.be.visible');

      // Assert that we have been redirected to the next page of they survey.
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          firstPage + 1,
          totalPages,
        ),
      );

      // Assert that the previous button is not disabled (clickable).
      cy.get('[data-test=prev]').click();

      // Assert that we have been redirected to the first page of they survey.
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          firstPage,
          totalPages,
        ),
      );
    });

    it('should display existing response, allow user to continue', () => {
      cy.route(`**/api/teams/*/responses`, [response]);
      cy.route(`**/api/users/*/responses`, [response]);

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Assert user is redirected so they can continue where they left off.
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          response.page + 1,
          totalPages,
        ),
      );

      // Assert that the first page of the survey is populated with the
      // existing response entries.
      cy.get('[data-test=prev]').click();

      forEach(responsesOnFirstPage, (compoundValue, inputName) => {
        const inputField = cy.get(`input[name=${inputName}]`);
        inputField.should('have.value', compoundValue.value);
      });
    });

    it('should display "completion" page', () => {
      const url = routes.toProgramModulePage(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
        totalPages - 1,
        totalPages,
      );

      cy.visit(url);

      cy.route({
        method: 'POST',
        url: '**/api/responses',
        response,
      });

      // Assert that we can click the next button.
      cy.get('[data-test=submit]').click();

      // Assert that we are redirected to the last page.
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          totalPages,
          totalPages,
        ),
      );

      // Assert Previous and Back to Task List are displayed on completion page
      cy.get('[data-test=prev]').should('be.visible');
      cy.get('[data-test=to-task-list]').should('be.visible');

      // Assert that the completion message is displayed.
      cy.get('[data-test=completion-message]').should('be.visible');
    });

    it('should display "already submitted" message when reviewing', () => {
      const completedResponse = {
        uid: 'Response_001',
        short_uid: '001',
        type: 'User',
        user_id: user.uid,
        team_id: team.uid,
        parent_id: taskParentLabel,
        module_label: taskModuleLabel,
        progress: 100,
        page: totalPages - 1,
        body: responsesOnFirstPage,
      };

      cy.route(`**/api/teams/*/responses`, [completedResponse]);
      cy.route(`**/api/users/*/responses`, [completedResponse]);

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Assert that user is redirected to first page.
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          firstPage,
          totalPages,
        ),
      );

      // Assert that already submitted note is being displayed.
      cy.get('[data-test=already-submitted]').should('be.visible');
    });

    it('handles conflicts if user chooses cancel', () => {
      const completedResponse = {
        uid: 'Response_001',
        short_uid: '001',
        type: 'User',
        user_id: user.uid,
        team_id: team.uid,
        parent_id: taskParentLabel,
        module_label: taskModuleLabel,
        progress: 100,
        page: totalPages - 1,
        body: responsesOnFirstPage,
      };

      cy.route(`**/api/teams/*/responses`, [completedResponse]);
      cy.route(`**/api/users/*/responses`, [completedResponse]);

      // Simulate a conflict.
      cy.route({
        method: 'PUT',
        url: '**/api/responses/*',
        response: 'conflict',
        status: 409,
      });

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Dirty the form, try to submit, choose cancel.
      cy.get('[name=foo11]').type('dirty form');
      cy.get('[name=foo12]').type('dirty form');
      cy.get('#why-do-you-teach-field-work-with-children').click();
      cy.get('#why-do-you-teach-field-make-a-difference').click();
      cy.get('[data-test=submit]').click();
      cy.get('[data-test=conflict-cancel-button').click();

      // Failure message should be visible, and navigation should be disabled.
      cy.get('[data-test=conflict-cancel-button').should('not.be.visible');
      cy.get('[data-test=submitFailed').should('be.visible');
      cy.get('[data-test=submit]').should('be.disabled');
    });

    it('handles conflicts if user chooses to save/override', () => {
      const completedResponse = {
        uid: 'Response_001',
        short_uid: '001',
        type: 'User',
        user_id: user.uid,
        team_id: team.uid,
        parent_id: taskParentLabel,
        module_label: taskModuleLabel,
        progress: 100,
        page: totalPages - 1,
        body: responsesOnFirstPage,
      };

      cy.route(`**/api/teams/*/responses`, [completedResponse]);
      cy.route(`**/api/users/*/responses`, [completedResponse]);

      // Simulate a conflict.
      cy.route({
        method: 'PUT',
        url: `**/api/responses/${response.uid}*`,
        response: 'conflict',
        status: 409,
      });
      // But allow it to be forced.
      cy.route({
        method: 'PUT',
        url: `**/api/responses/${response.uid}?force=true`,
        response: completedResponse,
      });

      const url = routes.toProgramModule(
        team.uid,
        taskStepType,
        taskParentLabel,
        taskModuleLabel,
      );

      cy.visit(url);

      // Dirty the form, try to submit, choose cancel.
      cy.get('[name=foo11]').type('dirty form');
      cy.get('[name=foo12]').type('dirty form');
      cy.get('#why-do-you-teach-field-work-with-children').click();
      cy.get('#why-do-you-teach-field-make-a-difference').click();
      cy.get('[data-test=submit]').click();
      cy.get('[data-test=conflict-override-button]').click();

      // No failure message, should be on the next page.
      cy.get('[data-test=conflict-override-button]').should('not.be.visible');
      cy.get('[data-test=submitFailed').should('not.be.visible');
      cy.url().should(
        'include',
        routes.toProgramModulePage(
          team.uid,
          taskStepType,
          taskParentLabel,
          taskModuleLabel,
          firstPage + 1,
          totalPages,
        ),
      );
    });
  });
});
