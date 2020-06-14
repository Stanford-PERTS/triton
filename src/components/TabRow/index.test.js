import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import TabRow from './';

const tabs = [
  {
    id: 'classrooms',
    text: 'Classes',
    href: '/classrooms',
  },
  {
    id: 'reports',
    text: 'Reports',
    href: '/reports',
  },
];

describe('TabRow component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<TabRow tabs={[]} />, div);
  });

  it('displays tab names', () => {
    const wrapper = mount(
      <BrowserRouter>
        <TabRow tabs={tabs} />
      </BrowserRouter>,
      document.createElement('div'),
    );
    tabs.forEach((t, i) => {
      expect(
        wrapper
          .find('.tab')
          .hostNodes()
          .at(i)
          .text(),
      ).toEqual(t.text);
    });
  });

  it('links tabs', () => {
    const wrapper = mount(
      <BrowserRouter>
        <TabRow tabs={tabs} />
      </BrowserRouter>,
      document.createElement('div'),
    );
    tabs.forEach((t, i) => {
      expect(
        wrapper
          .find('a')
          .at(i)
          .props().href,
      ).toEqual(t.href);
    });
  });

  it('toggles active class', () => {
    const activeId = tabs[0].id;
    const wrapper = mount(
      <BrowserRouter>
        <TabRow tabs={tabs} activeId={activeId} />
      </BrowserRouter>,
      document.createElement('div'),
    );
    tabs.forEach((t, i) => {
      const exp = expect(
        wrapper
          .find('.tab')
          .hostNodes()
          .at(i)
          .props().className,
      );
      if (t.id === activeId) {
        exp.toContain('active');
      } else {
        exp.not.toContain('active');
      }
    });
  });
});
