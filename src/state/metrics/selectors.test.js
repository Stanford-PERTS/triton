import keyBy from 'utils/keyBy';

import * as selectors from './selectors';
import deepFreeze from 'deep-freeze';

describe('metrics selectors', () => {
  const metrics = [
    { uid: 'Metric_001', description: 'Metric description one' },
    { uid: 'Metric_002', description: 'Metric description two' },
    { uid: 'Metric_003', description: 'Metric description three' },
  ];
  const metricsIds = ['Metric_001', 'Metric_002', 'Metric_003'];
  const state = {
    metrics: keyBy(metrics, m => m.uid),
    metricsIds,
    error: null,
    loading: false,
  };

  it('should getMetrics', () => {
    deepFreeze(state);
    expect(selectors.allMetrics(state)).toEqual(metrics);
  });

  it('should map metricId to bool', () => {
    const metricIdToBool = {
      Metric_001: false,
      Metric_002: false,
      Metric_003: false,
    };
    deepFreeze(state);
    expect(selectors.mapMetricIdToBool(state)).toEqual(metricIdToBool);
  });
});
