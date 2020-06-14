import uri from 'urijs';

import toParams from 'utils/toParams';

export {
  toNewOrganization,
  toOrganization,
  toOrganizationClassrooms,
  toOrganizationDashboard,
  toOrganizationReports,
  toOrganizationDetails,
  toOrganizationInstructions,
  toOrganizationTeams,
  toOrganizationUsers,
  toOrganizationUsersInvite,
} from './organizations';

// Central location for our routes, so that we don't have to hard code routes
// into our codebase anymore

// Roots

export const toRoot = () => '/';

export const toHome = (programLabel = ':programLabel') =>
  `/home/${programLabel}`;

// Also renders the home scene, but it will see `programLabel` as undefined,
// which triggers special redirection behavior. Not intended as a view.
export const toHomeNoProgram = () => `/home`;

export const toProgramSearch = (programLabel = ':programLabel', query) => {
  const path = uri(`/home/${programLabel}/search`);
  return query ? path.setSearch({ q: query }).toString() : path.toString();
};

// Auth

export const toLogin = () => '/login';

export const toSecretLogin = () => '/secret_login';

export const toLogout = () => '/logout';

export const toSignup = () => '/signup';

export const toSetPassword = (token = ':token') => `/set_password/${token}`;

export const toResetPassword = () => '/reset_password';

// Users

export const toUsers = () => '/users';

export const toNotifications = (userId = ':userId') =>
  `/users/${toParams(userId)}/notifications`;

export const toUserTeams = (userId = ':userId') =>
  `/users/${toParams(userId)}/teams`;

export const toUserDetails = (userId = ':userId') =>
  `/users/${toParams(userId)}`;

export const toTeamUserDetails = (teamId = ':teamId', userId = ':userId') =>
  `/teams/${toParams(teamId)}/settings/users/${toParams(userId)}`;

export const toTeamUsersInvite = (teamId, email) => {
  if (teamId) {
    let route = `/teams/${toParams(teamId)}/settings/users/invite`;
    if (email) {
      const uriEmail = encodeURIComponent(email);
      route += `/${uriEmail}`;
    }
    return route;
  }
  return '/teams/:teamId/settings/users/invite/:email?';
};

// Teams

export const toNewTeam = (programLabel = ':programLabel') =>
  `/home/${programLabel}/teams/new`;

export const toProgramSteps = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/steps`;

export const toProgramStep = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
) => `/teams/${toParams(teamId)}/steps/${stepType}/${parentLabel}`;

export const toProgramModule = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  moduleLabel = ':moduleLabel',
) =>
  `/teams/${toParams(teamId)}/steps/${stepType}/${parentLabel}/${moduleLabel}`;

export const toProgramModulePage = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  moduleLabel = ':moduleLabel',
  page = ':page',
  totalPages = ':totalPages',
) =>
  `${toProgramModule(
    teamId,
    stepType,
    parentLabel,
    moduleLabel,
  )}/${page}/${totalPages}`;

export const toTeamDetails = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/settings`;

export const toTeamUsers = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/settings/users`;

// Default toTeam route
export const toTeam = (teamId = ':teamId') => toProgramSteps(teamId);
// TeamSchedule aliases to toProgramSteps, phasing out toTeamSchedule
export const toTeamSchedule = (teamId = ':teamId') => toProgramSteps(teamId);

export const toTeamScheduleCycle = (teamId = ':teamId', cycleId = ':cycleId') =>
  `/teams/${toParams(teamId)}/schedule/${toParams(cycleId)}`;

export const toTeamScheduleCycleResponse = (
  teamId = ':teamId',
  cycleId = ':cycleId',
  responseId = ':responseId',
) =>
  `/teams/${toParams(teamId)}/schedule/${toParams(cycleId)}/response/${toParams(
    responseId,
  )}`;

export const toTeamClassrooms = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/classrooms`;

export const toNewClassroom = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/classrooms/new`;

export const toAttachOrganization = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/attach_organization`;

export const toTeamClassroom = (
  teamId = ':teamId',
  classroomId = ':classroomId',
) => `/teams/${toParams(teamId)}/classrooms/${toParams(classroomId)}`;

export const toTeamClassroomRoster = (
  teamId = ':teamId',
  classroomId = ':classroomId',
) => `/teams/${toParams(teamId)}/classrooms/${toParams(classroomId)}/roster`;

export const toRosterAdd = (teamId = ':teamId', classroomId = ':classroomId') =>
  `/teams/${toParams(teamId)}/classrooms/${toParams(classroomId)}/roster-add`;

// Surveys

export const toTeamSurvey = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/settings/survey`;

export const toTeamSurveyInstructions = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/settings/survey-instructions`;

export const toClassroomSurveyInstructions = (
  teamId = ':teamId',
  classroomId = ':classroomId',
) =>
  `/teams/${toParams(teamId)}/classrooms/${toParams(
    classroomId,
  )}/survey/instructions`;

export const toClassroomSettings = (
  teamId = ':teamId',
  classroomId = ':classroomId',
) => `/teams/${toParams(teamId)}/classrooms/${toParams(classroomId)}/settings`;

export const toProgramSurveyInstructions = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
) =>
  `/teams/${toParams(
    teamId,
  )}/steps/${stepType}/${parentLabel}/survey/instructions`;

// Team Documents (not set for all programs, see ProgramMenu from relevant
// program config file).

export const toTeamDocuments = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/documents`;

// Reports

export const toTeamReports = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/reports`;

export const toTeamReportsSettings = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/settings/reports`;

export const toReportsUpload = () => '/reports/upload';

// Team Organzations

export const toTeamOrganizations = (teamId = ':teamId') =>
  `/teams/${toParams(teamId)}/settings/organizations`;

// In-Program scenes (beneath program modules)

export const toProgramTeamUsers = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
) => `/teams/${toParams(teamId)}/steps/${stepType}/${parentLabel}/users`;

export const toProgramTeamUserDetails = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  userId = ':userId',
) =>
  `/teams/${toParams(teamId)}/steps/${stepType}/${parentLabel}/users/${toParams(
    userId,
  )}`;

export const toProgramTeamUserInvite = (teamId, stepType, parentLabel) =>
  toProgramTeamUserDetails(teamId, stepType, parentLabel, 'invite');

export const toProgramTeamClassrooms = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
) => `/teams/${toParams(teamId)}/steps/${stepType}/${parentLabel}/classrooms`;

export const toProgramTeamClassroom = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  classroomId = ':classroomId',
) =>
  `/teams/${toParams(
    teamId,
  )}/steps/${stepType}/${parentLabel}/classrooms/${toParams(classroomId)}`;

export const toProgramClassroomSettings = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  classroomId = ':classroomId',
) => {
  const tid = toParams(teamId);
  const cid = toParams(classroomId);
  return `/teams/${tid}/steps/${stepType}/${parentLabel}/classrooms/${cid}/settings`;
};

export const toProgramTeamClassroomNew = (teamId, stepType, parentLabel) =>
  toProgramTeamClassroom(teamId, stepType, parentLabel, 'new');

export const toProgramTeamClassroomRoster = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  classroomId = ':classroomId',
) =>
  `/teams/${toParams(
    teamId,
  )}/steps/${stepType}/${parentLabel}/classrooms/${toParams(
    classroomId,
  )}/roster`;

export const toProgramTeamRosterAdd = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  classroomId = ':classroomId',
) =>
  `/teams/${toParams(
    teamId,
  )}/steps/${stepType}/${parentLabel}/classrooms/${toParams(
    classroomId,
  )}/roster-add`;

export const toProgramClassroomSurveyInstructions = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  classroomId = ':classroomId',
) =>
  `/teams/${toParams(
    teamId,
  )}/steps/${stepType}/${parentLabel}/classrooms/${toParams(
    classroomId,
  )}/survey-instructions`;

// If scope is 'team': captain's view (or captain-like view) of
// participant-level progress. Includes all classrooms from the team.
// If scope is 'user': non-captain's view of participant-level progress. The
// available classrooms are filtered according to the user's main-contact
// status.
export const toCycleProgress = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
  scope = ':scope',
) =>
  `/teams/${toParams(
    teamId,
  )}/steps/${stepType}/${parentLabel}/progress/${scope}`;

export const toCycleProgressTeam = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
) => toCycleProgress(teamId, stepType, parentLabel, 'team');

export const toCycleProgressUser = (
  teamId = ':teamId',
  stepType = ':stepType',
  parentLabel = ':parentLabel',
) => toCycleProgress(teamId, stepType, parentLabel, 'user');
