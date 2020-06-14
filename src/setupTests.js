import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import noop from 'lodash/noop';

import './polyfills';

Enzyme.configure({ adapter: new Adapter() });

// Mock for react-media Media component
window.matchMedia = () => ({
  addListener: noop,
  removeListener: noop,
});

// Mock out scrollTo, can't scroll without a window.
window.scrollTo = () => false;

// Mock out chartjs features that are used in:
// - components/PercentSurveyedChart
// - components/DonutChart
// https://github.com/jerairrest/react-chartjs-2/issues/155
jest.mock('react-chartjs-2', () => ({
  defaults: { global: { legend: {}, tooltips: {} } },
  Chart: {
    pluginService: {
      register: () => null,
    },
  },
  Doughnut: () => null,
}));
