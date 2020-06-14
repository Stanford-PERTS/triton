import { all, takeLatest, put } from 'redux-saga/effects';
import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as metricsApi from 'services/triton/metrics';
import metricsSaga, { metricsRequest, metricRequest } from './sagas';

describe('metrics sagas', () => {
  it('should handle metrics requests', () => {
    const gen = metricsSaga();

    expect(gen.next().value).toEqual(
      all([
        takeLatest(types.METRICS_QUERY_REQUEST, metricsRequest),
        takeLatest(types.METRIC_GET_REQUEST, metricRequest),
      ]),
    );
  });

  /* Query Metrics */
  it('should handle a successful metrics request', () => {
    const metrics = [
      {
        uid: 'Metric_001',
        name: 'Community of Helpers',
      },
      {
        uid: 'Metric_002',
        name: 'Feedback for Learning',
      },
      {
        uid: 'Metric_003',
        name: 'Value of Learning',
      },
      {
        uid: 'Metric_004',
        name: 'Relationship with Adults',
      },
    ];
    const action = { type: types.METRICS_QUERY_REQUEST };

    const gen = metricsRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(metricsApi.query),
    );

    expect(gen.next(metrics).value).toEqual(
      put({ type: types.METRICS_QUERY_SUCCESS, metrics }),
    );
  });

  it('should handle an unsuccessful metrics request', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.METRICS_QUERY_REQUEST };

    const gen = metricsRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(metricsApi.query),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.METRICS_QUERY_FAILURE, error }),
    );
  });

  /* Get a Metric */
  it('should handle a successful metric request', () => {
    const metric = {
      uid: 'Metric_002',
      name: 'Feedback for Learning',
    };
    const action = { type: types.METRIC_GET_REQUEST, metricId: metric.uid };

    const gen = metricRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(metricsApi.get, action.metricId),
    );

    expect(gen.next(metric).value).toEqual(
      put({ type: types.METRIC_GET_SUCCESS, metric }),
    );
  });

  it('should handle an unsuccessful metric request', () => {
    const metric = {
      uid: 'Metric_002',
      name: 'Feedback for Learning',
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.METRICS_QUERY_REQUEST, metricId: metric.uid };

    const gen = metricRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(metricsApi.get, action.metricId),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.METRIC_GET_FAILURE, metricId: action.metricId, error }),
    );
  });
});
