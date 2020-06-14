import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from 'state/store';
import { mount } from 'enzyme';

import ResetPassword from './';
import ResetPasswordForm from './ResetPasswordForm';

describe('ResetPassword scene component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      </Provider>,
      div,
    );
  });

  it('displays the ResetPasswordForm component', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.find(ResetPasswordForm).length).toEqual(1);
  });

  it('displays a link to sign in', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.find('a').length).toEqual(1);
    expect(wrapper.find('a').props().href).toEqual('/login');
  });
});
