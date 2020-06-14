import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from 'state/store';

import RosterAdd from './';

describe('ClassroomRoster', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter>
          <RosterAdd />
        </MemoryRouter>
      </Provider>,
      div,
    );
  });
});
