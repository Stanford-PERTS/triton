import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import ReportsListWeekItem from './ReportsListWeekItem';

// ReportsListWeekItem imports getJwtToken, which uses localStorage
import localStorageMock from 'utils/localStorageMock';
window.localStorage = localStorageMock;

// https://stackoverflow.com/questions/54691799/how-to-test-a-react-component-that-is-dependent-on-usecontext-hook#58397768
jest.mock('react', () => {
  const ActualReact = require.requireActual('react');
  return {
    ...ActualReact,
    useContext: () => ({
      team: 'Team',
      classroom: 'Class',
    }),
  };
});

describe('ReportsListWeekItem component', () => {
  const classroomReport = {
    parent_id: 'Classroom_Cla123456',
    filename: 'Classroom_Cla123456.2017-01-01.html',
    name: 'English for Snakes',
    link: '/api/classrooms/Classroom_001/reports/2017-01-01.html?token=foo',
  };

  const teamReport = {
    parent_id: 'Team_Tea123456',
    filename: 'Team_Tea123456.2017-01-01.html',
    name: 'Team Viper',
    link: '/api/teams/Team_001/reports/2017-01-01.html?token=foo',
  };

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <ReportsListWeekItem report={classroomReport} />
      </MemoryRouter>,
      div,
    );
  });

  describe('when classroom provided', () => {
    it('displays a link to classroom report file', () => {
      const wrapper = mount(
        <MemoryRouter>
          <ReportsListWeekItem report={classroomReport} />
        </MemoryRouter>,
      );

      expect(wrapper.find('a').length).toEqual(1);
      expect(wrapper.find('a').props().href).toContain(classroomReport.link);
    });

    it('displays the classroom name', () => {
      const wrapper = mount(
        <MemoryRouter>
          <ReportsListWeekItem report={classroomReport} />
        </MemoryRouter>,
      );

      expect(wrapper.text()).toEqual(`Class: ${classroomReport.name}`);
    });

    it('displays the team name', () => {
      const wrapper = mount(
        <MemoryRouter>
          <ReportsListWeekItem report={teamReport} />
        </MemoryRouter>,
      );

      expect(wrapper.text()).toEqual(`Team: ${teamReport.name}`);
    });
  });
});
