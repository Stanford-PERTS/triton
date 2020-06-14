import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { MemoryRouter, Redirect } from 'react-router-dom';
import AuthenticatedRoute from './';
import uri from 'urijs';

const div = document.createElement('div');

const Component = () => <div>This is a protected component.</div>;

const location = {
  pathname: '/some/auth/route',
};

const props = {
  component: Component,
  location,
};

describe('AuthenticatedRoute component', () => {
  it('renders without crashing', () => {
    ReactDOM.render(
      <MemoryRouter>
        <AuthenticatedRoute {...props} />
      </MemoryRouter>,
      div,
    );
  });

  it(`redirects with continue_url search when access not allowed`, () => {
    const redirectTo = '/newpath';
    const pathname = uri(redirectTo)
      .setSearch({ continue_url: location.pathname })
      .toString();

    const wrapper = mount(
      <MemoryRouter>
        <AuthenticatedRoute
          {...props}
          authenticated={false}
          redirectTo={redirectTo}
        />
      </MemoryRouter>,
    );

    // does not render the protected component
    expect(wrapper.find(Component).length).toEqual(0);
    // but instead redirects
    expect(wrapper.find(Redirect).length).toEqual(1);
    // to the specified new path
    expect(wrapper.find(Redirect).props().to).toEqual(pathname);
  });

  it('renders the protected component when access is allowed', () => {
    const wrapper = mount(
      <MemoryRouter>
        <AuthenticatedRoute {...props} authenticated={true} />
      </MemoryRouter>,
    );

    expect(wrapper.find(Component).length).toEqual(1);
  });
});
