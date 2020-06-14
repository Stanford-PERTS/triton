import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import ensureReduxActionType from 'utils/ensureReduxActionType';

// Import root reducer and root saga
import rootReducer from './reducers';
import rootSaga from './sagas';

// Set up sagas middleware
const sagaMiddleware = createSagaMiddleware();

// To enable Redux DevTools
const composeSetup =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

// Create redux store
export const configureStore = initialState =>
  createStore(
    rootReducer,
    initialState,
    composeSetup(
      applyMiddleware(ensureReduxActionType),
      applyMiddleware(sagaMiddleware),
    ),
  );

const store = configureStore();

// Allow access of store from within Cypress tests.
if (window.Cypress) {
  window.store = store;
}

// Start up sagas
sagaMiddleware.run(rootSaga);

// Export redux store
export default store;
