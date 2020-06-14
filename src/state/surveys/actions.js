import * as types from './actionTypes';

export const queryTeamSurveys = teamId => ({
  type: types.SURVEY_BY_TEAM_REQUEST,
  teamId,
});

export const getSurvey = surveyId => ({
  type: types.SURVEY_GET_REQUEST,
  surveyId,
});

export const updateSurvey = survey => ({
  type: types.SURVEY_UPDATE_REQUEST,
  survey,
});
