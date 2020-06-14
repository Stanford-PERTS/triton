import * as route from './index';
import toParams from 'utils/toParams';

describe('routes', () => {
  // Auth

  it('should return route to Root', () => {
    const expected = '/';
    const actual = route.toRoot();
    expect(actual).toEqual(expected);
  });

  it('should return route to Home', () => {
    const programLabel = 'ep19';

    const expectedDefault = '/home/:programLabel';
    const actualDefault = route.toHome();
    expect(actualDefault).toEqual(expectedDefault);

    const expected = `/home/${programLabel}`;
    const actual = route.toHome(programLabel);
    expect(actual).toEqual(expected);
  });

  it('should return route to Home without program', () => {
    const expected = '/home';
    const actual = route.toHomeNoProgram();
    expect(actual).toEqual(expected);
  });

  it('should return route to Login', () => {
    const expected = '/login';
    const actual = route.toLogin();
    expect(actual).toEqual(expected);
  });

  it('should return route to Logout', () => {
    const expected = '/logout';
    const actual = route.toLogout();
    expect(actual).toEqual(expected);
  });

  it('should return route to Signup', () => {
    const expected = '/signup';
    const actual = route.toSignup();
    expect(actual).toEqual(expected);
  });

  it('should return route to Set Password', () => {
    const expectedDefault = '/set_password/:token';
    const actualDefault = route.toSetPassword();
    expect(actualDefault).toEqual(expectedDefault);

    const token = 'oiwoiuj9u120394ul;ias098';
    const expected = `/set_password/${token}`;
    const actual = route.toSetPassword(token);
    expect(actual).toEqual(expected);
  });

  it('should return route to Reset Password', () => {
    const expected = '/reset_password';
    const actual = route.toResetPassword();
    expect(actual).toEqual(expected);
  });

  // Users

  it('should return route to Users', () => {
    const expected = '/users';
    const actual = route.toUsers();
    expect(actual).toEqual(expected);
  });

  it('should return route to User Teams', () => {
    const expectedDefault = '/users/:userId/teams';
    const actualDefault = route.toUserTeams();
    expect(actualDefault).toEqual(expectedDefault);

    const userId = 'User_001';
    const expected = `/users/${toParams(userId)}/teams`;
    const actual = route.toUserTeams(userId);
    expect(actual).toEqual(expected);
  });

  it('should return route to User Details', () => {
    const expectedDefault = '/users/:userId';
    const actualDefault = route.toUserDetails();
    expect(actualDefault).toEqual(expectedDefault);

    const userId = 'User_001';
    const expected = `/users/${toParams(userId)}`;
    const actual = route.toUserDetails(userId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team User Details', () => {
    const expectedDefault = '/teams/:teamId/settings/users/:userId';
    const actualDefault = route.toTeamUserDetails();
    expect(actualDefault).toEqual(expectedDefault);

    // Called with both teamId and classroomId
    const teamId = 'Team_001';
    const userId = 'User_001';
    const expected = `/teams/${toParams(teamId)}/settings/users/${toParams(
      userId,
    )}`;
    const actual = route.toTeamUserDetails(teamId, userId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team Users Invite', () => {
    const expectedDefault = '/teams/:teamId/settings/users/invite/:email?';
    const actualDefault = route.toTeamUsersInvite();
    expect(actualDefault).toEqual(expectedDefault);

    // Called with just teamId
    const teamId = 'Team_001';
    let expected = `/teams/${toParams(teamId)}/settings/users/invite`;
    let actual = route.toTeamUsersInvite(teamId);
    expect(actual).toBe(expected);

    // Called with both teamId and email
    const email = 'user@example.com';
    const encodedEmail = encodeURIComponent(email);
    expected = `/teams/${toParams(
      teamId,
    )}/settings/users/invite/${encodedEmail}`;
    actual = route.toTeamUsersInvite(teamId, email);
    expect(actual).toEqual(expected);
  });

  // Teams

  it('should return route to New Team', () => {
    const expectedDefault = '/home/:programLabel/teams/new';
    const actualDefault = route.toNewTeam();
    expect(actualDefault).toEqual(expectedDefault);

    const programLabel = 'ep19';
    const expected = `/home/${programLabel}/teams/new`;
    const actual = route.toNewTeam(programLabel);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team', () => {
    const expectedDefault = '/teams/:teamId/steps';
    const actualDefault = route.toTeam();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/steps`;
    const actual = route.toTeam(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team Schedule', () => {
    const expectedDefault = '/teams/:teamId/steps';
    const actualDefault = route.toTeamSchedule();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/steps`;
    const actual = route.toTeamSchedule(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team Details', () => {
    const expectedDefault = '/teams/:teamId/settings';
    const actualDefault = route.toTeamDetails();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/settings`;
    const actual = route.toTeamDetails(teamId);
    expect(actual).toEqual(expected);
  });

  // Classrooms

  it('should return route to Team Classrooms', () => {
    const expectedDefault = '/teams/:teamId/classrooms';
    const actualDefault = route.toTeamClassrooms();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/classrooms`;
    const actual = route.toTeamClassrooms(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to New Classroom', () => {
    const expectedDefault = '/teams/:teamId/classrooms/new';
    const actualDefault = route.toNewClassroom();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/classrooms/new`;
    const actual = route.toNewClassroom(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team Classroom', () => {
    const expectedDefault = '/teams/:teamId/classrooms/:classroomId';
    const actualDefault = route.toTeamClassroom();
    expect(actualDefault).toEqual(expectedDefault);

    // Called with both teamId and classroomId
    const teamId = 'Team_001';
    const classroomId = 'Classroom_001';
    const expected = `/teams/${toParams(teamId)}/classrooms/${toParams(
      classroomId,
    )}`;
    const actual = route.toTeamClassroom(teamId, classroomId);
    expect(actual).toEqual(expected);
  });

  // Surveys
  it('should return route to Team Survey', () => {
    const expectedDefault = '/teams/:teamId/settings/survey';
    const actualDefault = route.toTeamSurvey();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/settings/survey`;
    const actual = route.toTeamSurvey(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team Details', () => {
    const expectedDefault = '/teams/:teamId/settings';
    const actualDefault = route.toTeamDetails();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/settings`;
    const actual = route.toTeamDetails(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Team Survey Instructions', () => {
    const expectedDefault = '/teams/:teamId/settings/survey-instructions';
    const actualDefault = route.toTeamSurveyInstructions();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/settings/survey-instructions`;
    const actual = route.toTeamSurveyInstructions(teamId);
    expect(actual).toEqual(expected);
  });

  // Reports

  it('should return route to Team Reports', () => {
    const expectedDefault = '/teams/:teamId/reports';
    const actualDefault = route.toTeamReports();
    expect(actualDefault).toEqual(expectedDefault);

    const teamId = 'Team_001';
    const expected = `/teams/${toParams(teamId)}/reports`;
    const actual = route.toTeamReports(teamId);
    expect(actual).toEqual(expected);
  });

  it('should return route to Reports Upload', () => {
    const expected = '/reports/upload';
    const actual = route.toReportsUpload();
    expect(actual).toEqual(expected);
  });
});
