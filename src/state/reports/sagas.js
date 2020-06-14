import map from 'lodash/map';
import { all, takeEvery, takeLatest, put } from 'redux-saga/effects';

import * as reportsApi from 'services/triton/reports';
import * as types from './actionTypes';
import fullTypeOfAction from 'state/helpers/fullTypeOfAction';
import generateSagaFunctions from 'state/helpers/generateSagaFunctions';
import { actionMethods, actionStages } from 'state/actionTypes';
import { callWithApiAuthentication } from 'state/api';
import { queryClassroomsByTeam } from 'state/classrooms/actions';
import { slice } from './';

export function* teamReportsRequest(action) {
  try {
    const reports = yield callWithApiAuthentication(
      reportsApi.queryByTeam,
      action.teamId,
    );

    // Also get classrooms so we can display these reports in their context.
    yield put(queryClassroomsByTeam(action.teamId));

    yield put({
      type: types.TEAM_REPORTS_SUCCESS,
      reports,
      teamId: action.teamId,
    });
  } catch (error) {
    yield put({
      type: types.TEAM_REPORTS_FAILURE,
      error,
      teamId: action.teamId,
    });
  }
}

const apiCalls = action => ({
  QUERY: {
    BY_ORGANIZATION: [reportsApi.queryByOrganization, action.byId],
  },
});

const sagaFunctions = generateSagaFunctions(apiCalls, slice);
const REPORTS_QUERY_BY_ORGANIZATON_REQUEST = fullTypeOfAction({
  actionSlice: slice,
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_ORGANIZATION',
  actionStage: actionStages.REQUEST,
});

export default function* reportsSaga() {
  yield all([
    ...map(sagaFunctions, (fn, type) => takeEvery(type, fn)),
    takeEvery(
      REPORTS_QUERY_BY_ORGANIZATON_REQUEST,
      sagaFunctions.REPORTS_QUERY_REQUEST,
    ),
    takeLatest(types.TEAM_REPORTS_REQUEST, teamReportsRequest),
  ]);
}
