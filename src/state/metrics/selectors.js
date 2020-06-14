import _values from 'lodash/values';

export const allMetrics = state =>
  _values(state.metrics).sort((a, b) => {
    // alphabetical sort
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

export const mapMetricIdToBool = state =>
  Object.keys(state.metrics).reduce((o, m) => {
    o[m] = false;
    return o;
  }, {});
