import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import ConnectedMetric, { Metric } from '../Metric';
import { getMetric } from 'state/metrics/actions';
import { METRIC_GET_REQUEST } from 'state/metrics/actionTypes';

const mockStore = configureStore();

// mock metrics
const metrics = {
  Metric_001: {
    name: 'Metric 1',
    description: 'Read This!',
    links: [
      {
        type: 'reading',
        url: 'http://www.example.com',
        text: 'Text 1',
      },
      {
        type: 'researcher',
        url: 'http://www.example.com',
        text: 'Text 2',
      },
    ],
  },
};

describe('Metric shallow render', () => {
  const props = {
    match: {
      params: {
        metricId: 'Metric_001',
      },
    },
    metrics,
  };

  it('should render dumb component', () => {
    const wrapper = shallow(<Metric {...props} />);
    expect(wrapper.length).toEqual(1);
  });

  it('should render null when metric isEmpty', () => {
    const wrapper = shallow(<Metric />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });
});

describe('Metric shallow render + passing the {store} directly', () => {
  let store;
  const initialState = {
    entities: { metrics: { byId: metrics } },
  };

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('render the connected componet', () => {
    const wrapper = shallow(<ConnectedMetric store={store} />);
    expect(wrapper.length).toEqual(1);
  });

  it('check Prop matches with initialState', () => {
    const wrapper = shallow(<ConnectedMetric store={store} />);
    expect(wrapper.prop('metrics')).toEqual(initialState.entities.metrics.byId);
  });
});

describe('Metric mount render + wrapping in <Provider>', () => {
  let store;
  const initialState = {
    entities: { metrics: { byId: metrics } },
  };

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('render the connected component', () => {
    const metricId = 'Metric_001';
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/metrics/${metricId}`]}>
          <Route path="/metrics/:metricId" component={ConnectedMetric} />
        </MemoryRouter>
      </Provider>,
    );
    expect(wrapper.find(ConnectedMetric).length).toEqual(1);
  });

  it('render null with unknown metricId', () => {
    const invalidMetricId = 'Invalid_Metric_Id';
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/metrics/${invalidMetricId}`]}>
          <Route path="/metrics/:metricId" component={ConnectedMetric} />
        </MemoryRouter>
      </Provider>,
    );
    expect(wrapper.find(Metric).isEmptyRender()).toBe(true);
  });

  it('check Prop matches initialState', () => {
    const metricId = 'Metric_001';
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/metrics/${metricId}`]}>
          <Route path="/metrics/:metricId" component={ConnectedMetric} />
        </MemoryRouter>
      </Provider>,
    );
    expect(wrapper.find(Metric).prop('metrics')).toEqual(
      initialState.entities.metrics.byId,
    );
  });

  // This test may be overkill... The unit test of the action itself should be
  // enough.
  it('check action on dispatching ', () => {
    const metricId = 'Metric_001';
    store.dispatch(getMetric(metricId));
    const actions = store.getActions();
    expect(actions[0].type).toBe(METRIC_GET_REQUEST);
  });
});
