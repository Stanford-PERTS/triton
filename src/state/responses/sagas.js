import { all, takeEvery, put } from 'redux-saga/effects';
import { callWithApiAuthentication } from '../api';

import { CLEAR_FLAGS } from 'state/actionTypes';
import * as types from './actionTypes';
import * as responsesApi from 'services/triton/responses';

export function* responsesByTeamRequest(action) {
  try {
    const responses = yield callWithApiAuthentication(
      responsesApi.queryByTeam,
      action.teamId,
      action.params,
    );

    yield put({ type: types.RESPONSES_BY_TEAM_SUCCESS, responses });
  } catch (error) {
    yield put({ type: types.RESPONSES_BY_TEAM_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* responsesAddRequest(action) {
  try {
    const response = yield callWithApiAuthentication(
      responsesApi.post,
      action.response,
    );

    yield put({ type: types.RESPONSES_ADD_SUCCESS, response });
  } catch (error) {
    yield put({ type: types.RESPONSES_ADD_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* responsesUpdateRequest(action) {
  try {
    const response = yield callWithApiAuthentication(
      responsesApi.update,
      {
        uid: action.responseId,
        ...action.response,
      },
      { force: action.force },
    );

    yield put({ type: types.RESPONSES_UPDATE_SUCCESS, response });
  } catch (error) {
    yield put({ type: types.RESPONSES_UPDATE_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export default function* responsesSaga() {
  yield all([
    takeEvery(types.RESPONSES_BY_TEAM_REQUEST, responsesByTeamRequest),
    takeEvery(types.RESPONSES_ADD_REQUEST, responsesAddRequest),
    takeEvery(types.RESPONSES_UPDATE_REQUEST, responsesUpdateRequest),
  ]);
}
