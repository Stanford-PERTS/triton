import * as actions from './actions';
import * as types from './actionTypes';

describe('metrics actions', () => {
  it('should create an action to request all metrics', () => {
    const expectedAction = {
      type: types.METRICS_QUERY_REQUEST,
    };
    expect(actions.getAllMetrics()).toEqual(expectedAction);
  });

  it('should create an action to a metric', () => {
    const metricId = 'Metric_001';
    const expectedAction = {
      type: types.METRICS_GET_REQUEST,
      metricId,
    };
    expect(actions.getMetric(metricId)).toEqual(expectedAction);
  });
});
