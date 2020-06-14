import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import Section from './';

describe('Section component', () => {
  const MockTitle = 'A Section Title';
  const MockLink = '/some/link';
  const MockChild = () => <div>I am a child component!</div>;

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Section title={MockTitle} />
      </MemoryRouter>,
      div,
    );
  });

  it('renders the section title', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Section title={MockTitle} />
      </MemoryRouter>,
    );

    expect(wrapper.text()).toContain(MockTitle);
  });

  it('renders new link when link provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Section title={MockTitle} to={MockLink} />
      </MemoryRouter>,
    );

    expect(wrapper.find('a').length).toEqual(1);
    expect(wrapper.find('a').props().href).toContain(MockLink);
  });

  it('doesnt render new link when link not provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Section title={MockTitle} />
      </MemoryRouter>,
    );

    expect(wrapper.find('a').length).toEqual(0);
  });

  it('renders the child component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Section title={MockTitle}>
          <MockChild />
        </Section>
      </MemoryRouter>,
    );

    expect(wrapper.find(MockChild).length).toEqual(1);
  });
});
