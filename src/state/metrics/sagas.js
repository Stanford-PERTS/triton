import { all, takeLatest, put } from 'redux-saga/effects';
import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as metricsApi from 'services/triton/metrics';

export function* metricsRequest() {
  try {
    const metrics = yield callWithApiAuthentication(metricsApi.query);
    yield put({ type: types.METRICS_QUERY_SUCCESS, metrics });
  } catch (error) {
    yield put({ type: types.METRICS_QUERY_FAILURE, error });
  }
}

export function* metricRequest(action) {
  try {
    const metric = yield callWithApiAuthentication(
      metricsApi.get,
      action.metricId,
    );
    yield put({ type: types.METRIC_GET_SUCCESS, metric });
  } catch (error) {
    yield put({
      type: types.METRIC_GET_FAILURE,
      metricId: action.metricId,
      error,
    });
  }
}

export default function* metricsSaga() {
  yield all([
    takeLatest(types.METRICS_QUERY_REQUEST, metricsRequest),
    takeLatest(types.METRIC_GET_REQUEST, metricRequest),
  ]);
}
