import * as types from './actionTypes';

export const getAllMetrics = () => ({ type: types.METRICS_QUERY_REQUEST });

export const getMetric = metricId => ({
  type: types.METRIC_GET_REQUEST,
  metricId,
});
