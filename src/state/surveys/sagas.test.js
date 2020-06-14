import { all, takeEvery, takeLatest, put } from 'redux-saga/effects';
import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as surveysApi from 'services/triton/surveys';
import surveysSaga, {
  surveyByTeamRequest,
  surveyRequest,
  surveyUpdateRequest,
} from './sagas';

describe('surveys sagas', () => {
  it('should handle surveys requests', () => {
    const gen = surveysSaga();

    expect(gen.next().value).toEqual(
      all([
        takeEvery(types.SURVEY_BY_TEAM_REQUEST, surveyByTeamRequest),
        takeLatest(types.SURVEY_GET_REQUEST, surveyRequest),
        takeLatest(types.SURVEY_UPDATE_REQUEST, surveyUpdateRequest),
      ]),
    );
  });

  /* Query Survey by Team */
  it('should handle a successful survey by team request', () => {
    const survey = [
      {
        uid: 'Survey_001',
        team_id: 'Team_001',
        metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
      },
    ];
    const teamId = 'Team_001';
    const action = { type: types.SURVEY_BY_TEAM_REQUEST, teamId };

    const gen = surveyByTeamRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(surveysApi.queryByTeam, action.teamId),
    );

    expect(gen.next(survey).value).toEqual(
      put({ type: types.SURVEY_BY_TEAM_SUCCESS, survey }),
    );
  });

  it('should handle an unsuccessful surveys by team request', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const teamId = 'Team_001';
    const action = { type: types.SURVEY_BY_TEAM_REQUEST, teamId };

    const gen = surveyByTeamRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(surveysApi.queryByTeam, action.teamId),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.SURVEY_BY_TEAM_FAILURE, error }),
    );
  });

  /* Get a Survey */
  it('should handle a successful survey request', () => {
    const survey = {
      uid: 'Survey_001',
      team_id: 'Team_001',
      metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
    };
    const action = { type: types.SURVEY_GET_REQUEST, surveyId: survey.uid };

    const gen = surveyRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(surveysApi.get, action.surveyId),
    );

    expect(gen.next(survey).value).toEqual(
      put({ type: types.SURVEY_GET_SUCCESS, survey }),
    );
  });

  it('should handle an unsuccessful survey request', () => {
    const survey = {
      uid: 'Survey_001',
      team_id: 'Team_001',
      metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = {
      type: types.SURVEY_BY_TEAM_REQUEST,
      surveyId: survey.uid,
    };

    const gen = surveyRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(surveysApi.get, action.surveyId),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.SURVEY_GET_FAILURE, error }),
    );
  });

  /* Update a survey */
  it('should handle a successful survey update request', () => {
    const survey = {
      uid: 'Survey_001',
      team_id: 'Team_001',
      metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
    };
    const action = { type: types.SURVEY_UPDATE_REQUEST, survey };

    const gen = surveyUpdateRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(surveysApi.update, action.survey),
    );

    expect(gen.next(survey).value).toEqual(
      put({ type: types.SURVEY_UPDATE_SUCCESS, survey }),
    );
  });
  it('should handle an unsuccessful survey update request', () => {
    const survey = {
      uid: 'Survey_001',
      team_id: 'Team_001',
      metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.SURVEY_UPDATE_REQUEST, survey };

    const gen = surveyUpdateRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(surveysApi.update, action.survey),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.SURVEY_UPDATE_FAILURE, error }),
    );
  });
});
