import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { generateUser } from 'utils/fakerUtils';
import authApi from 'services/auth';

import * as actions from './actions';
import * as usersTypes from 'state/users/actionTypes';
import authSaga from './sagas';
import reducer from './reducer';

describe('auth saga with reducer', () => {
  it('should handle a successful login', () => {
    const user = generateUser();
    const password = 'password';
    // get state from reucer
    const state = reducer();

    return expectSaga(authSaga)
      .dispatch(actions.loginUser(user.email, password))
      .provide([
        [matchers.call.fn(authApi.login), user],
        [matchers.call.fn(authApi.addUserToErrorTracking)],
      ])
      .dispatch({ type: usersTypes.USER_SUCCESS })
      .withReducer(reducer)
      .hasFinalState({
        ...state,
        user,
      })
      .run();
  });
});
