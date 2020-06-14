import pickBy from 'lodash/pickBy';
import keyBy from 'utils/keyBy';

import * as types from './actionTypes';
import initialState from './initialState';

export default (state = initialState, action) => {
  switch (action.type) {
    // Query Metrics
    case types.METRICS_QUERY_REQUEST:
      return { ...state, error: null, loading: true };

    case types.METRICS_QUERY_SUCCESS:
      return {
        byId: keyBy(action.metrics, e => e.uid),
        metricsIds: action.metrics.map(e => e.uid),
        error: null,
        loading: false,
      };

    case types.METRICS_QUERY_FAILURE:
      return {
        byId: {},
        metricsIds: [],
        error: action.error,
        loading: false,
      };

    // Get Metric
    case types.METRIC_GET_REQUEST:
      return { byId: {}, error: null, loading: true };

    case types.METRIC_GET_SUCCESS:
      return {
        byId: {
          ...state.byId,
          ...keyBy(action.metric, e => e.uid),
        },
        error: null,
        loading: false,
      };

    case types.METRIC_GET_FAILURE:
      return {
        // If we failed to get the requested metric, then return all existing
        // metrics and omit the one requested.
        byId: pickBy(state.byId, m => m.uid !== action.metricId),
        error: action.error,
        loading: false,
      };

    // Default
    default:
      return state;
  }
};
