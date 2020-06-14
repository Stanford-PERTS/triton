import * as types from './actionTypes';

export const removeTeamUser = (team, user) => ({
  type: types.REMOVE_TEAM_USER_REQUEST,
  team,
  user,
});

export const removeOrganizationUser = (organization, user) => ({
  type: types.REMOVE_ORGANIZATION_USER_REQUEST,
  organization,
  user,
});

export const leaveTeam = team => ({
  type: types.LEAVE_TEAM_REQUEST,
  team,
});

export const leaveOrganization = organization => ({
  type: types.LEAVE_ORGANIZATION_REQUEST,
  organization,
});

export const attachOrganizationToTeam = (organizationCode, team) => ({
  type: types.TEAM_ATTACH_ORGANIZATION_REQUEST,
  team,
  organizationCode,
});
