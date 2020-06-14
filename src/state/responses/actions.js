import * as types from './actionTypes';

export const queryResponsesByTeam = (teamId, params = {}) => ({
  type: types.RESPONSES_BY_TEAM_REQUEST,
  teamId,
  params,
});

export const addResponse = response => ({
  type: types.RESPONSES_ADD_REQUEST,
  response,
});

export const updateResponse = (responseId, response, force) => ({
  type: types.RESPONSES_UPDATE_REQUEST,
  responseId,
  response,
  force,
});
