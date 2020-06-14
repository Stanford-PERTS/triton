import * as types from './actionTypes';

export const getTeamReports = teamId => ({
  type: types.TEAM_REPORTS_REQUEST,
  teamId,
});
