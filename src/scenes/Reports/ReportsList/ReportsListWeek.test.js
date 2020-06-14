import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import ReportsListWeek, { formattedDate } from './ReportsListWeek';
import ReportsListWeekItem from './ReportsListWeekItem';

// ReportsListWeekItem imports getJwtToken, which uses localStorage
import localStorageMock from 'utils/localStorageMock';
window.localStorage = localStorageMock;

describe('ReportsListWeek component', () => {
  const classrooms = {
    Classroom_ABC001: { short_uid: 'ABC001', name: 'English for Snakes' },
    Classroom_ABC002: { short_uid: 'ABC002', name: 'French for Snakes' },
  };

  const teams = {
    Team_Tea001: { short_uid: 'Tea001', name: 'Team Viper' },
    Team_Tea002: { short_uid: 'Tea002', name: 'Team Snakes' },
  };

  const reports = [
    {
      uid: 'Report_001',
      parent_id: 'Classroom_ABC001',
      classroom_id: 'Classroom_ABC001',
      team_id: 'Team_Tea001',
      filename: 'Classroom_ABC001',
    },
    {
      uid: 'Report_002',
      parent_id: 'Classroom_ABC001',
      classroom_id: 'Classroom_ABC002',
      team_id: 'Team_Tea001',
      filename: 'Classroom_ABC002',
    },
    {
      uid: 'Report_003',
      parent_id: 'Classroom_ABC001',
      classroom_id: 'Classroom_ABC002',
      team_id: 'Team_Tea001',
      filename: 'Classroom_ABC002',
    },
    {
      uid: 'Report_004',
      parent_id: 'Team_Tea001',
      classroom_id: null,
      team_id: 'Team_Tea001',
      filename: 'Team_Tea001.2017-01-01.html',
    },
  ];

  const classroomOnlyReports = [
    {
      uid: 'Report_001',
      parent_id: 'Classroom_ABC001',
      classroom_id: 'Classroom_ABC001',
      team_id: 'Team_Tea001',
      filename: 'Classroom_ABC001',
    },
    {
      uid: 'Report_004',
      parent_id: 'Team_Tea001',
      classroom_id: null,
      team_id: 'Team_Tea001',
      filename: 'Team_Tea001.2017-01-01.html',
    },
  ];
  const week = '2017-01-01';

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <ReportsListWeek
          classrooms={classrooms}
          teams={teams}
          reports={reports}
          week={week}
        />
      </MemoryRouter>,
      div,
    );
  });

  it('renders a ReportsListWeekItem for each report', () => {
    const wrapper = mount(
      <MemoryRouter>
        <ReportsListWeek
          classrooms={classrooms}
          teams={teams}
          reports={reports}
          week={week}
        />
      </MemoryRouter>,
    );

    expect(wrapper.find(ReportsListWeekItem).length).toEqual(reports.length);
  });

  it('hides the team report when theres only one classroom report', () => {
    const wrapper = mount(
      <MemoryRouter>
        <ReportsListWeek
          classrooms={classrooms}
          teams={teams}
          reports={classroomOnlyReports}
          week={week}
        />
      </MemoryRouter>,
    );

    expect(wrapper.find(ReportsListWeekItem).length).toEqual(1);
    // ^= means attribute value begins with
    expect(wrapper.find('[data-test^="Classroom"]').hostNodes().length).toEqual(
      1,
    );
  });

  it('displays the formatted week', () => {
    const date = formattedDate(week);

    const wrapper = mount(
      <MemoryRouter>
        <ReportsListWeek
          classrooms={classrooms}
          teams={teams}
          reports={reports}
          week={week}
        />
      </MemoryRouter>,
    );

    expect(wrapper.text()).toContain(date);
  });
});
