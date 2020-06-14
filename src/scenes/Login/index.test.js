import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from 'state/store';
import { mount } from 'enzyme';
import htmlParser from 'html-react-parser';

import Login, { SET_PASSWORD_SUCCESS_MESSAGE } from './';
import LoginForm from './LoginForm';

describe('Login scene component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    // mock query string props
    const location = { search: '' };

    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter>
          <Login location={location} />
        </MemoryRouter>
      </Provider>,
      div,
    );
  });

  it('displays the LoginForm component', () => {
    // mock query string props
    const location = { search: '' };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <Login location={location} />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.find(LoginForm).length).toEqual(1);
  });

  it('displays a link to sign up and reset password', () => {
    // mock query string props
    const location = { search: '' };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <Login location={location} />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      wrapper.find({ href: '/reset_password' }).hostNodes().length,
    ).toEqual(1);
  });

  it('displays password set success message on setPassword flag', () => {
    // mock query string props
    const location = { search: '?setPassword=true' };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <Login location={location} />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.contains(htmlParser(SET_PASSWORD_SUCCESS_MESSAGE))).toEqual(
      true,
    );
  });

  it('no password set success message w/o setPassword flag', () => {
    // mock query string props
    const location = { search: '' };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <Login location={location} />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.contains(htmlParser(SET_PASSWORD_SUCCESS_MESSAGE))).toEqual(
      false,
    );
  });
});
