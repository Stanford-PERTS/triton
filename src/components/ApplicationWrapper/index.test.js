import AppWrapper from './';
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import store from 'state/store';

describe('AppWrapper component', () => {
  const MockChild = () => <div>I am a child component!</div>;

  it('renders without crashing', () => {
    // MemoryRouter required to test components that utilize react-router
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Provider store={store}>
          <AppWrapper>
            <MockChild />
          </AppWrapper>
        </Provider>
      </MemoryRouter>,
      div,
    );
  });

  it('renders the child component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <AppWrapper>
            <MockChild />
          </AppWrapper>
        </Provider>
      </MemoryRouter>,
    );
    expect(wrapper.find(MockChild).length).toEqual(1);
  });
});
