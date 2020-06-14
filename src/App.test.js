import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from 'state/store';

import { App } from './App';

// The following test is serving as the big "does it all load" test. So we need
// to wrap up App in a Provider to make sure it hooks itself into Redux nicely.
// http://redux.js.org/docs/recipes/WritingTests.html#connected-components
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div,
  );
});
