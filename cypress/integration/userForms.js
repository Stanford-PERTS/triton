/* global cy */
import * as routes from 'routes';
import mocks from 'mocks';

describe('UserDetails', () => {
  it('should display success when form submission succeeds', () => {
    const user = mocks.createUser({
      consent: true,
    });

    const newUserName = 'Ann Newly Named';

    const team = mocks.createTeam();
    const survey = mocks.createSurvey();
    mocks.join(user, team);
    mocks.setUserCaptain(user, team);

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    // Return at least one team to avoid the helper modal
    cy.route(`/api/users/${user.uid}/teams`, [team]);
    cy.route(`/api/users/${user.uid}/organizations`, []);
    cy.route(`/api/teams/*/survey`, survey);
    cy.route({
      method: 'PUT',
      url: `/api/users/${user.uid}`,
      response: {
        ...user,
        name: newUserName,
      },
    });

    cy.visit(routes.toUserDetails(user.uid));

    cy.get('input[name=email]').should('be.disabled');
    cy.get('input[name=name]')
      .clear()
      .type(newUserName);

    cy.get('button[data-test=submit]').click();

    cy.get('[data-test=submitSucceeded]').should('be.visible');
    cy.get('[data-test=submitFailed]').should('not.be.visible');
  });

  it('should display error when form submission fails', () => {
    const user = mocks.createUser({
      consent: true,
    });

    const newUserName = 'Ann Newly Named';

    const team = mocks.createTeam();
    mocks.join(user, team);
    mocks.setUserCaptain(user, team);

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    // Return at least one team to avoid the helper modal
    cy.route(`http://localhost:10080/api/users/${user.uid}/teams`, [team]);
    cy.route(`http://localhost:10080/api/users/${user.uid}/organizations`, []);
    cy.route({
      method: 'PUT',
      url: `http://localhost:10080/api/users/${user.uid}`,
      status: 500,
      // cy.route() cannot accept an undefined or null response. It must be set
      // to something, even an empty string will work.
      response: '',
    });

    cy.visit(routes.toUserDetails(user.uid));

    cy.get('input[name=email]').should('be.disabled');
    cy.get('input[name=name]')
      .clear()
      .type(newUserName);

    cy.get('button[data-test=submit]').click();

    cy.get('[data-test=submitSucceeded]').should('not.be.visible');
    cy.get('[data-test=submitFailed]').should('be.visible');
  });
});

describe('TeamUserInvite', () => {
  it('should display submitting', () => {
    const invitingUser = mocks.createUser({
      consent: true,
    });

    const invitee = mocks.createUser({
      name: 'Ann Newly Named',
      email: 'ann@school.edu',
    });

    const program = { uid: 'Program_001', label: 'ep19' };
    const team = mocks.createTeam({ program_id: program.uid });
    mocks.join(invitingUser, team);
    mocks.setUserCaptain(invitingUser, team);

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, invitingUser);
    mocks.cy.authenticate(invitingUser);

    // Return at least one team to avoid the helper modal
    cy.route('/api/programs', [program]);
    cy.route('PUT', '/api/users/*', invitingUser);
    cy.route(`/api/users/${invitingUser.uid}/teams`, [team]);
    cy.route(`/api/users/${invitingUser.uid}/organizations`, []);
    cy.route({
      method: 'GET',
      url: `/api/teams/${team.uid}`,
      headers: mocks.cy.mockNeptuneResponseHeaders(
        invitingUser.uid,
        invitingUser.email,
      ),
      response: team,
    });
    cy.route(`/api/teams/${team.uid}/users`, [invitingUser]);
    cy.route(`/api/teams/${team.uid}/survey`, {
      metrics: [],
    });
    cy.route(`/api/teams/${team.uid}/classrooms`, []);

    cy.route(`http://localhost:10080/api/accounts/${invitee.email}`, invitee);
    cy.route(`http://localhost:8080/api/accounts/${invitee.email}`, {
      email: invitee.email,
      verified: false,
    });

    cy.route({
      method: 'POST',
      url: `http://localhost:8080/api/invitations`,
      response: invitee,
      delay: 1000,
    });
    cy.route({
      method: 'POST',
      url: `http://localhost:10080/api/invitations`,
      response: invitee,
    });

    cy.visit(routes.toTeamUsersInvite(team.uid));

    cy.get('input[name=name]')
      .clear()
      .type(invitee.name);
    cy.get('input[name=email]')
      .clear()
      .type(invitee.email);

    cy.route(`/api/teams/${team.uid}/users`, [invitingUser, invitee]);

    mocks.join(invitee, team);

    cy.get('button[data-test=submit]').click();
    cy.get('button[data-test=submitting]').should('be.disabled');
  });

  it('should invite user and display new user in team user list', () => {
    const invitingUser = mocks.createUser({
      consent: true,
    });

    const invitee = mocks.createUser({
      name: 'Ann Newly Named',
      email: 'ann@school.edu',
    });

    const program = { uid: 'Program_001', label: 'ep19' };
    const team = mocks.createTeam({ program_id: program.uid });
    mocks.join(invitingUser, team);
    mocks.setUserCaptain(invitingUser, team);

    cy.server();

    mocks.cy.setupAuthenticationRoutes(cy, invitingUser);
    mocks.cy.authenticate(invitingUser);

    // Return at least one team to avoid the helper modal
    cy.route('/api/programs', [program]);
    cy.route('PUT', '/api/users/*', invitingUser);
    cy.route(`/api/users/${invitingUser.uid}/teams`, [team]);
    cy.route(`/api/users/${invitingUser.uid}/organizations`, []);
    cy.route({
      method: 'GET',
      url: `/api/teams/${team.uid}`,
      headers: mocks.cy.mockNeptuneResponseHeaders(
        invitingUser.uid,
        invitingUser.email,
      ),
      response: team,
    });
    cy.route(`/api/teams/${team.uid}/users`, [invitingUser]);
    cy.route(`/api/teams/${team.uid}/survey`, {
      metrics: [],
    });
    cy.route(`/api/teams/${team.uid}/classrooms`, []);

    cy.route(`http://localhost:10080/api/accounts/${invitee.email}`, invitee);
    cy.route(`http://localhost:8080/api/accounts/${invitee.email}`, {
      email: invitee.email,
      verified: false,
    });
    cy.route({
      method: 'POST',
      url: `http://localhost:8080/api/invitations`,
      response: invitee,
    });
    cy.route({
      method: 'POST',
      url: `http://localhost:10080/api/invitations`,
      response: invitee,
    });

    cy.visit(routes.toTeamUsersInvite(team.uid));

    cy.get('input[name=name]')
      .clear()
      .type(invitee.name);
    cy.get('input[name=email]')
      .clear()
      .type(invitee.email);

    cy.route(`/api/teams/${team.uid}/users`, [invitingUser, invitee]);

    mocks.join(invitee, team);

    cy.get('button[data-test=submit]').click();

    cy.url().should('include', routes.toTeamUsers(team.uid));
    cy.get('[data-test=team-user]').should('contain', invitee.name);
  });
});
