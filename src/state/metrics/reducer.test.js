import pickBy from 'lodash/pickBy';
import keyBy from 'utils/keyBy';

import reducer from './reducer';
import * as types from './actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('metrics reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    expect(reducer(stateBefore, action)).toEqual(stateBefore);
  });

  // Query Metrics
  it('handles METRICS_QUERY_REQUEST', () => {
    const action = { type: types.METRICS_QUERY_REQUEST };

    const stateBefore = { byId: {}, error: null, loading: false };
    const stateAfter = { byId: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRICS_QUERY_SUCCESS', () => {
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
    const action = { type: types.METRICS_QUERY_SUCCESS, metrics };

    const stateBefore = {
      byId: {},
      metricsIds: [],
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: keyBy(action.metrics, e => e.uid),
      metricsIds: action.metrics.map(e => e.uid),
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRICS_QUERY_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.METRICS_QUERY_FAILURE, error };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: {},
      metricsIds: [],
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Get a Metric
  it('handles METRIC_GET_REQUEST', () => {
    const action = { type: types.METRIC_GET_REQUEST };

    const stateBefore = { byId: {}, error: null, loading: false };
    const stateAfter = { byId: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRIC_GET_SUCCESS', () => {
    const metric = {
      uid: 'Metric_001',
      name: 'Community of Helpers',
    };
    const action = { type: types.METRIC_GET_SUCCESS, metric };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: keyBy(action.metric, e => e.uid),
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRIC_GET_SUCCESS, existing metrics, new metric', () => {
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
    const metric = {
      uid: 'Metric_005', // new uid
      name: 'Learning Something New',
    };
    const action = { type: types.METRIC_GET_SUCCESS, metric };

    const stateBefore = {
      byId: keyBy(metrics, m => m.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: {
        ...keyBy(metrics, e => e.uid),
        ...keyBy(action.metric, e => e.uid),
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRIC_GET_SUCCESS, existing metrics, overwrite metric', () => {
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
    const metric = {
      uid: 'Metric_002', // existing uid
      name: 'Learning Something New',
    };
    const action = { type: types.METRIC_GET_SUCCESS, metric };

    const stateBefore = {
      byId: keyBy(metrics, m => m.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: {
        ...keyBy(metrics, e => e.uid),
        ...keyBy(action.metric, e => e.uid),
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRIC_GET_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.METRIC_GET_FAILURE, error };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: {},
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRIC_GET_FAILURE, existing metrics, new metric', () => {
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
    const error = { code: '403', message: 'Unauthorized' };
    const action = {
      type: types.METRIC_GET_FAILURE,
      metricId: 'Metric_005',
      error,
    };

    const stateBefore = {
      byId: keyBy(metrics, m => m.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: keyBy(metrics, m => m.uid),
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles METRIC_GET_FAILURE, existing metrics, existing metric', () => {
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
    const error = { code: '403', message: 'Unauthorized' };
    const action = {
      type: types.METRIC_GET_FAILURE,
      metricId: 'Metric_003',
      error,
    };

    const stateBefore = {
      byId: keyBy(metrics, m => m.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: pickBy(keyBy(metrics, m => m.uid), m => m.uid !== action.metricId),
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
