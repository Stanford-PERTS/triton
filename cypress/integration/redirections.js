/* global cy */
import * as routes from 'routes';
import mocks from 'mocks';

const adminUser = mocks.createUser({
  uid: 'User_admin',
  short_uid: 'admin',
  name: 'Cy Admin',
  email: 'admin@perts.net',
});
mocks.setUserSuperAdmin(adminUser);

const normalUser = mocks.createUser({
  uid: 'User_normal',
  short_uid: 'normal',
  name: 'Normal Ned',
  email: 'normal@perts.net',
});

const createMultiCaptain = () => {
  const program = mocks.createProgram();
  const multiCaptain = mocks.createUser({
    uid: 'User_multi-captain',
    short_uid: 'multi-captain',
    name: 'Multi Captain',
    email: 'multiCaptain@perts.net',
    recent_program_id: program.uid,
  });
  const team1 = mocks.createTeam({ name: 'Team One', program_id: program.uid });
  const team2 = mocks.createTeam({ name: 'Team Two', program_id: program.uid });
  mocks.setUserCaptain(multiCaptain, team1);
  mocks.setUserCaptain(multiCaptain, team2);

  return {
    program,
    user: multiCaptain,
    teams: [team1, team2],
  };
};

afterEach(() => {
  cy.window().then(win => {
    win.location.href = 'about:blank';
  });
});

describe('Login redirections', () => {
  it('redirects to continue_url', () => {
    // Make a user with at least two teams to avoid being redirected
    // into the team view.
    const { program, user, teams } = createMultiCaptain();

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', teams);

    // Continue url should override program.
    cy.visit(
      `${routes.toLogin()}?program=${program.label}&continue_url=/users/${
        user.short_uid
      }`,
    );

    cy.get('input[id=email-field]').type(user.email);
    cy.get('input[id=password-field]').type('1231231231');
    cy.get('.LoginFormSubmit').click();

    cy.url().should('include', routes.toUserDetails(user.uid));
  });

  it('redirects to program home based on query string', () => {
    // Make a user with at least two teams to avoid being redirected
    // into the team view.
    const { program, user, teams } = createMultiCaptain();
    user.recent_program_id = undefined;

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', teams);

    // The app will update the user's recent program. It will continue to try
    // to update it as long as it's blank. So make sure to respond with a user
    // with the recent id set.
    cy.route('PUT', '/api/users/*', {
      ...user,
      recent_program_id: program.uid,
    });

    cy.visit(`${routes.toLogin()}?program=${program.label}`);

    cy.get('input[id=email-field]').type(user.email);
    cy.get('input[id=password-field]').type('1231231231');
    cy.get('.LoginFormSubmit').click();

    cy.url().should('include', routes.toHome(program.label));
  });

  it('redirects to program home based on recent program', () => {
    // Make a user with at least two teams to avoid being redirected
    // into the team view.
    const { program, user, teams } = createMultiCaptain();

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', teams);
    cy.route('PUT', '/api/users/*', user);

    cy.visit(routes.toLogin());

    cy.get('input[id=email-field]').type(user.email);
    cy.get('input[id=password-field]').type('1231231231');
    cy.get('.LoginFormSubmit').click();

    cy.url().should('include', routes.toHome(program.label));
  });

  it('redirects to program home based on owned teams', () => {
    // Make a user with at least two teams to avoid being redirected
    // into the team view.
    const { program, user, teams } = createMultiCaptain();
    // No recent program to go on.
    user.recent_program_id = undefined;

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', teams);
    cy.route('PUT', '/api/users/*', user);

    cy.visit(routes.toLogin());

    cy.get('input[id=email-field]').type(user.email);
    cy.get('input[id=password-field]').type('1231231231');
    cy.get('.LoginFormSubmit').click();

    cy.url().should('include', routes.toHome(program.label));
  });

  it('redirects to team, if only one in program', () => {
    // Make a user with two team, but on different programs. The single team
    // on the selected program should trigger redirect into team.
    const { program, user, teams } = createMultiCaptain();
    teams[1].program_id = 'other';

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', teams);
    // For the team view
    cy.route('/api/users/*/responses', []);
    cy.route('/api/teams/*', {});
    cy.route('/api/teams/*/*', []);
    cy.route('PUT', '/api/users/*', user);

    cy.visit(routes.toLogin());

    cy.get('input[id=email-field]').type(user.email);
    cy.get('input[id=password-field]').type('1231231231');
    cy.get('.LoginFormSubmit').click();

    cy.url().should('include', routes.toProgramSteps(teams[0].uid));
  });

  it('redirects to a warning otherwise', () => {
    const program = mocks.createProgram();
    const user = mocks.createUser(); // doesn't own anything, no recent program

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', []);

    cy.visit(`${routes.toLogin()}`); // no search param

    cy.get('input[id=email-field]').type(user.email);
    cy.get('input[id=password-field]').type('1231231231');
    cy.get('.LoginFormSubmit').click();

    cy.url().should('include', routes.toHomeNoProgram());

    cy.get('a[data-test="no-program-link"]').should(
      'have.attr',
      'href',
      'https://perts.net/programs',
    );
    cy.get('.UserWelcomeModal').should('have.length', 0);
  });

  it('redirects to recent program if you visit /home directly', () => {
    const { program, user, teams } = createMultiCaptain();

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);
    cy.route('/api/programs', [program]);
    cy.route('/api/users/*/organizations', []);
    cy.route('/api/users/*/teams', teams);
    cy.route('PUT', '/api/users/*', user);

    cy.visit(routes.toHomeNoProgram());

    cy.url().should('include', routes.toHome(program.label));
  });
});

describe('App redirections', () => {
  it('redirects after adding students', () => {
    const program = mocks.createProgram();
    const team = mocks.createTeam({ name: 'Team V', program_id: program.uid });
    const classroom = mocks.createClassroom({ team_id: team.uid });
    mocks.setUserCaptain(adminUser, team);
    const survey = mocks.createSurvey({ team_id: team.uid });

    const stepType = 'fooStep';
    const parentLabel = 'fooParent';

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, adminUser);
    mocks.cy.authenticate(adminUser);

    cy.route('PATCH', '**/api/participants', []);
    mocks.cy.authRoute(cy, adminUser, '**/api/teams/*', team);
    cy.route('**/api/programs', [program]);
    cy.route('PUT', '/api/users/*', adminUser);
    cy.route('**/api/teams/*/users', [adminUser]);
    cy.route('**/api/teams/*/classrooms', [classroom]);
    cy.route('**/api/classrooms/*', classroom);
    cy.route('**/api/classrooms/*/participants', []);
    cy.route('**/api/teams/*/cycles', []);
    cy.route('**/api/users/*/responses', []);
    cy.route('**/api/teams/*/responses', []);
    cy.route('**/api/teams/*/survey', survey);

    // "Normal" view, from "Classroms" in sidebar.
    cy.visit(routes.toRosterAdd(team.uid, classroom.uid));

    cy.get('textarea[name=student_ids]').type('123');
    cy.get('button[type=submit]').click();

    cy.url().should('include', routes.toTeamClassroom(team.uid, classroom.uid));

    // "Program" view, from steps/stages.
    cy.visit(
      routes.toProgramTeamRosterAdd(
        team.uid,
        stepType,
        parentLabel,
        classroom.uid,
      ),
    );

    cy.get('textarea[name=student_ids]').type('123');
    cy.get('button[type=submit]').click();

    cy.url().should(
      'include',
      routes.toProgramTeamClassroom(
        team.uid,
        stepType,
        parentLabel,
        classroom.uid,
      ),
    );
  });

  it('redirects toLogin when not logged in', () => {
    const url = '/teams/5f0d9d69eac4/settings';
    cy.visit(url);
    cy.url().should(
      'include',
      `${routes.toLogin()}?continue_url=${encodeURIComponent(url)}`,
    );
  });

  const addingUserRoutes = (user, program, team, survey) => {
    cy.route({
      method: 'GET',
      url: `**/api/accounts/**`,
      response: '',
      status: 404,
    }).as('getNeptuneTeammateAccount');

    mocks.cy.setupAuthenticationRoutes(cy, user);
    mocks.cy.authenticate(user);

    cy.route('**/api/programs', [program]);
    cy.route('PUT', '/api/users/*', user).as('putUser');
    cy.route({
      method: 'GET',
      url: '**/api/teams/*',
      headers: mocks.cy.mockNeptuneResponseHeaders(user.uid, user.email),
      response: team,
    });
    cy.route('**/api/teams/*/users', [user]);
    cy.route({
      method: 'GET',
      url: '**/api/teams/*/classrooms',
      headers: mocks.cy.mockNeptuneResponseHeaders(user.uid, user.email),
      response: [],
    });
    cy.route('**/api/teams/*/cycles', []);
    cy.route('**/api/teams/*/cycles/current', '');
    cy.route('**/api/users/*/responses', []);
    cy.route('**/api/teams/*/responses', []);
    cy.route('**/api/teams/*/survey', survey).as('getSurvey');
    cy.route(`**/api/accounts/${user.email}`, user);
    cy.route('POST', '**/api/invitations', {});
  };

  it('redirects after adding a user, normal view', () => {
    const program = mocks.createProgram();
    const team = mocks.createTeam({ name: 'Team V', program_id: program.uid });
    mocks.setUserCaptain(adminUser, team);
    const survey = mocks.createSurvey({ team_id: team.uid });

    cy.server();
    addingUserRoutes(adminUser, program, team, survey);

    // Normal view

    const url = routes.toTeamUsersInvite(team.uid);
    const redirect = routes.toTeamUsers(team.uid);
    cy.visit(url);

    cy.wait('@getSurvey').wait('@putUser');
    cy.url().should('include', url);

    cy.get('input[name=email]').type('team@a.co');
    cy.get('input[name=name]').type('Invitee');
    cy.get('button[data-test=submit]').click();

    cy.url().should('include', redirect);
  });

  it('redirects after adding a user, program view', () => {
    const program = mocks.createProgram();
    const team = mocks.createTeam({ name: 'Team V', program_id: program.uid });
    mocks.setUserCaptain(adminUser, team);
    const survey = mocks.createSurvey({ team_id: team.uid });

    cy.server();
    addingUserRoutes(adminUser, program, team, survey);

    // Program context

    const step = 'single';
    const parent = 'recruitment';
    const url = routes.toProgramTeamUserInvite(team.uid, step, parent);
    const redirect = routes.toProgramTeamUsers(team.uid, step, parent);
    cy.visit(url);
    cy.wait('@getSurvey').wait('@putUser');
    cy.url().should('include', url);

    cy.get('input[name=email]')
      .should('be.visible')
      .type('prog@a.co');
    cy.get('input[name=name]')
      .should('be.visible')
      .type('Invitee');
    cy.get('button[data-test=submit]').click();

    cy.url().should('include', redirect);
  });

  it('redirects toProgramSteps after creating new team', () => {
    const program = mocks.createProgram();
    const team = mocks.createTeam({ name: 'Team V', program_id: program.uid });
    mocks.setUserCaptain(adminUser, team);
    const survey = mocks.createSurvey({ team_id: team.uid });

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, adminUser);
    mocks.cy.authenticate(adminUser);

    cy.route('/api/programs', [program]);
    cy.route('PUT', '/api/users/*', adminUser);
    cy.route('POST', '**/api/teams', team);
    cy.route('**/api/teams', [team]);
    cy.route({
      method: 'GET',
      url: '**/api/teams/*',
      headers: mocks.cy.mockNeptuneResponseHeaders(
        adminUser.uid,
        adminUser.email,
      ),
      response: team,
    });
    cy.route('**/api/teams/*/users', [adminUser]);
    cy.route({
      method: 'GET',
      url: '**/api/teams/*/classrooms',
      headers: mocks.cy.mockNeptuneResponseHeaders(
        adminUser.uid,
        adminUser.email,
      ),
      response: [],
    });
    cy.route('**/api/teams/*/cycles', []);
    cy.route('**/api/teams/*/cycles/current', '');
    cy.route('**/api/users/*/responses', []);
    cy.route('**/api/teams/*/responses', []);
    cy.route('**/api/teams/*/survey', survey);

    cy.visit(routes.toNewTeam(program.label));
    cy.url().should('include', routes.toNewTeam(program.label));

    cy.get('input[id=name-field]').type(team.name);
    cy.get('.SubmitButton').click();

    cy.url().should('include', routes.toProgramSteps(team.uid));
  });

  it('redirects toTeamClassrooms after creating new class, normal view', () => {
    const program = mocks.createProgram();
    const team = mocks.createTeam({ name: 'Team V', program_id: program.uid });
    mocks.setUserCaptain(normalUser, team);
    const survey = mocks.createSurvey({ team_id: team.uid });
    const classroom = mocks.createClassroom();

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, normalUser);
    mocks.cy.authenticate(normalUser);

    cy.route('/api/programs', [program]);
    cy.route('PUT', '/api/users/*', normalUser);
    cy.route('POST', '**/api/codes', { code: classroom.code });
    cy.route('POST', '**/api/classrooms', classroom);
    cy.route('GET', `**/api/classrooms/${classroom.uid}`, classroom);
    cy.route('GET', `**/api/classrooms/*/participants`, []);
    cy.route({
      method: 'GET',
      url: '**/api/teams/*',
      headers: mocks.cy.mockNeptuneResponseHeaders(
        normalUser.uid,
        normalUser.email,
      ),
      response: team,
    });
    cy.route('**/api/teams/*/users', [normalUser]);
    cy.route({
      method: 'GET',
      url: '**/api/teams/*/classrooms',
      headers: mocks.cy.mockNeptuneResponseHeaders(
        normalUser.uid,
        normalUser.email,
      ),
      response: [],
    });
    cy.route('**/api/teams/*/survey', survey);

    cy.visit(routes.toNewClassroom(team.uid));
    cy.url().should('include', routes.toNewClassroom(team.uid));

    cy.get('input[data-test="name"]').type(team.name);
    cy.get('button[data-test="submit-button"]').click();

    cy.url().should('include', routes.toTeamClassrooms(team.uid));
  });

  it('redirects toTeamClassrooms after creating new class, program view', () => {
    const program = mocks.createProgram();
    const team = mocks.createTeam({ name: 'Team V', program_id: program.uid });
    mocks.setUserCaptain(normalUser, team);
    const survey = mocks.createSurvey({ team_id: team.uid });
    const classroom = mocks.createClassroom();

    cy.server();
    mocks.cy.setupAuthenticationRoutes(cy, normalUser);
    mocks.cy.authenticate(normalUser);

    cy.route('/api/programs', [program]);
    cy.route('PUT', '/api/users/*', normalUser);
    cy.route('POST', '**/api/codes', { code: classroom.code });
    cy.route('POST', '**/api/classrooms', classroom);
    cy.route('GET', `**/api/classrooms/${classroom.uid}`, classroom);
    cy.route('GET', `**/api/classrooms/*/participants`, []);
    cy.route('GET', `**/api/teams/*/cycles/current`, '');
    cy.route({
      method: 'GET',
      url: '**/api/teams/*',
      headers: mocks.cy.mockNeptuneResponseHeaders(
        normalUser.uid,
        normalUser.email,
      ),
      response: team,
    });
    cy.route('**/api/teams/*/users', [normalUser]);
    cy.route({
      method: 'GET',
      url: '**/api/teams/*/classrooms',
      headers: mocks.cy.mockNeptuneResponseHeaders(
        normalUser.uid,
        normalUser.email,
      ),
      response: [],
    });
    cy.route('**/api/teams/*/survey', survey);
    cy.route('**/api/teams/*/responses', []);
    cy.route('**/api/teams/*/cycles', []);

    const stepType = 'step';
    const parentLabel = 'parent';
    cy.visit(routes.toProgramTeamClassroomNew(team.uid, stepType, parentLabel));
    cy.url().should(
      'include',
      routes.toProgramTeamClassroomNew(team.uid, stepType, parentLabel),
    );

    cy.get('input[data-test="name"]').type(team.name);
    cy.get('button[data-test="submit-button"]').click();

    cy.url().should(
      'include',
      routes.toProgramTeamClassroom(
        team.uid,
        stepType,
        parentLabel,
        classroom.short_uid,
      ),
    );
  });
});
