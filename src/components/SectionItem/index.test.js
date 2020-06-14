import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import SectionItem from './';

describe('SectionItem component', () => {
  const MockChild = () => <div>I am a child component!</div>;
  const MockIcon = 'university';
  const MockLink = '/some/link';

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <SectionItem>
          <MockChild />
        </SectionItem>
      </MemoryRouter>,
      div,
    );
  });

  it('renders the child component', () => {
    const wrapper = mount(
      <MemoryRouter>
        <SectionItem>
          <MockChild />
        </SectionItem>
      </MemoryRouter>,
    );

    expect(wrapper.find(MockChild).length).toEqual(1);
  });

  it('renders icon when provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <SectionItem icon={MockIcon}>
          <MockChild />
        </SectionItem>
      </MemoryRouter>,
    );

    expect(wrapper.find('i').length).toEqual(1);
    expect(wrapper.find('i').props().className).toContain(MockIcon);
  });

  it('doesnt render icon when not provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <SectionItem>
          <MockChild />
        </SectionItem>
      </MemoryRouter>,
    );

    expect(wrapper.find('i').length).toEqual(0);
  });

  it('renders link when provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <SectionItem to={MockLink}>
          <MockChild />
        </SectionItem>
      </MemoryRouter>,
    );

    expect(wrapper.find('a').length).toEqual(1);
    expect(wrapper.find('a').props().href).toContain(MockLink);
  });

  it('doesnt renders link when noy provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <SectionItem>
          <MockChild />
        </SectionItem>
      </MemoryRouter>,
    );

    expect(wrapper.find('a').length).toEqual(0);
  });
});
