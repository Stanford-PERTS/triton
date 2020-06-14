import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import moment from 'moment/moment';

import * as types from './actionTypes';
import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';

/**
 * Handle conversion from moment dates to string format that server expects
 * here so that we don't have to do it in scene handlers.
 * Assumes that all date properties are nested within `team.task_data`.
 * @param  {Object} team from store
 * @return {Object}      clone, with string dates replaced with moment dates
 */
const convertDatesToServer = team => {
  const clonedTeam = cloneDeep(team);
  forEach(team.task_data, (v, k) => {
    if (moment.isMoment(v)) {
      clonedTeam.task_data[k] = v
        .clone()
        .utc()
        .format();
    }
  });
  return clonedTeam;
};

export const queryTeamsByUser = queryOptions => ({
  actionSlice: 'TEAMS',
  actionOptions: 'BY_USER',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.REQUEST,
  type: types.USER_TEAMS_REQUEST,
  queryOptions,
});

export const queryTeamsByUserSuccess = (teams, links) => ({
  actionSlice: 'TEAMS',
  actionOptions: 'BY_USER',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.SUCCESS,
  type: types.USER_TEAMS_SUCCESS,
  teams,
  links,
});

export const queryTeamsByUserFailure = error => ({
  actionSlice: 'TEAMS',
  actionOptions: 'BY_USER',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.FAILURE,
  type: types.USER_TEAMS_FAILURE,
  error: String(error),
});

export const queryTeamsByOrganization = organizationId => ({
  actionSlice: 'TEAMS',
  actionOptions: 'BY_ORGANIZATION',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.REQUEST,
  type: types.TEAMS_BY_ORGANIZATION_REQUEST,
  organizationId,
});

export const queryTeamsByOrganizationSuccess = (teams, organizationId) => ({
  actionSlice: 'TEAMS',
  actionOptions: 'BY_ORGANIZATION',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.SUCCESS,
  type: types.TEAMS_BY_ORGANIZATION_SUCCESS,
  teams,
  organizationId,
});

export const queryTeamsByOrganizationFailure = (error, organizationId) => ({
  actionSlice: 'TEAMS',
  actionOptions: 'BY_ORGANIZATION',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.FAILURE,
  type: types.TEAMS_BY_ORGANIZATION_FAILURE,
  error: String(error),
  organizationId,
});

export const getTeam = teamId => ({
  actionSlice: 'TEAMS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.REQUEST,
  actionUids: [teamId],
  type: types.TEAM_REQUEST,
  teamId,
});

export const getTeamOnly = teamId => ({
  type: types.TEAM_ONLY_REQUEST,
  teamId,
});

export const addTeamOnly = (team, adder) => ({
  type: types.TEAM_ADD_REQUEST,
  team,
  adder,
});

export const addTeam = (team, adder) =>
  addActionTypeToAction({
    actionPrefix: 'HOA',
    actionSlice: 'TEAMS',
    actionMethod: actionMethods.ADD,
    actionStage: actionStages.REQUEST,
    team,
    adder,
  });

export const addTeamSuccess = teamId =>
  addActionTypeToAction({
    actionPrefix: 'HOA',
    actionSlice: 'TEAMS',
    actionMethod: actionMethods.ADD,
    actionStage: actionStages.SUCCESS,
    teamId,
  });

export const addTeamFailure = error =>
  addActionTypeToAction({
    actionPrefix: 'HOA',
    actionSlice: 'TEAMS',
    actionMethod: actionMethods.ADD,
    actionStage: actionStages.FAILURE,
    error: String(error),
  });

export const updateTeam = team => ({
  type: types.TEAM_UPDATE_REQUEST,
  team: convertDatesToServer(team),
});

export const removeTeamOrganization = (team, organizationId) => ({
  type: types.TEAM_REMOVE_ORGANIZATION_REQUEST,
  team,
  organizationId,
});

export const removeTeam = team => ({ type: types.TEAM_REMOVE_REQUEST, team });

export const setTeamMode = mode => ({ type: types.TEAM_MODE_SET, mode });

export const resetTeamMode = () => ({ type: types.TEAM_MODE_RESET });
