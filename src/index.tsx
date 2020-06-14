import React from 'react';
import ReactDOM from 'react-dom';

import 'font-awesome/css/font-awesome.css';
import './index.css';
import App from './App';

import { Provider } from 'react-redux';
import store from 'state/store';

// Save parts of Redux store to localStorage on unload. Unload occurs when
// navigating away from the page (reloads count).

import saveToLocalStorage from 'services/saveToLocalStorage';
saveToLocalStorage(store);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
