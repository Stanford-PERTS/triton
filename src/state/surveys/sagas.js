import { all, takeEvery, takeLatest, put } from 'redux-saga/effects';
import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as surveysApi from 'services/triton/surveys';

export function* surveyByTeamRequest(action) {
  try {
    const survey = yield callWithApiAuthentication(
      surveysApi.queryByTeam,
      action.teamId,
    );
    yield put({ type: types.SURVEY_BY_TEAM_SUCCESS, survey });
  } catch (error) {
    yield put({ type: types.SURVEY_BY_TEAM_FAILURE, error });
  }
}

export function* surveyRequest(action) {
  try {
    const survey = yield callWithApiAuthentication(
      surveysApi.get,
      action.surveyId,
    );
    yield put({ type: types.SURVEY_GET_SUCCESS, survey });
  } catch (error) {
    yield put({ type: types.SURVEY_GET_FAILURE, error });
  }
}

export function* surveyUpdateRequest(action) {
  try {
    const survey = yield callWithApiAuthentication(
      surveysApi.update,
      action.survey,
    );
    yield put({ type: types.SURVEY_UPDATE_SUCCESS, survey });
  } catch (error) {
    yield put({ type: types.SURVEY_UPDATE_FAILURE, error });
  }
}

export default function* surveysSaga() {
  yield all([
    takeEvery(types.SURVEY_BY_TEAM_REQUEST, surveyByTeamRequest),
    takeLatest(types.SURVEY_GET_REQUEST, surveyRequest),
    takeLatest(types.SURVEY_UPDATE_REQUEST, surveyUpdateRequest),
  ]);
}
