import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from 'state/store';

import AuthWrapper from './';

describe('AuthWrapper component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter>
          <AuthWrapper />
        </MemoryRouter>
      </Provider>,
      div,
    );
  });
});
