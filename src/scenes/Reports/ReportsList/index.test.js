import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import ReportsList from './';

// ReportsListWeekItem imports getJwtToken, which uses localStorage
import localStorageMock from 'utils/localStorageMock';
window.localStorage = localStorageMock;

describe('ReportsList', () => {
  const classrooms = {
    Classroom_ABC001: { short_uid: 'ABC001', name: 'English for Snakes' },
    Classroom_ABC002: { short_uid: 'ABC002', name: 'French for Snakes' },
  };

  const teams = {
    Team_Tea001: { short_uid: 'Tea001', name: 'Team Viper' },
    Team_Tea002: { short_uid: 'Tea002', name: 'Team Snakes' },
  };

  const reportsByWeek = {
    '2017-01-01': [],
    '2017-01-08': [],
    '2017-01-15': [],
  };

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <ReportsList
          classrooms={classrooms}
          teams={teams}
          reportsByWeek={reportsByWeek}
        />
      </MemoryRouter>,
      div,
    );
  });
});
