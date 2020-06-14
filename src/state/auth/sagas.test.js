import { all, takeLatest, call, put } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { generateUser } from 'utils/fakerUtils';
import * as types from './actionTypes';
import * as actions from './actions';
import * as usersTypes from 'state/users/actionTypes';
import * as usersActions from 'state/users/actions';
import { CLEAR_FLAGS } from 'state/actionTypes';
import authApi from 'services/auth';
import authSaga, {
  loginRequest,
  logoutRequest,
  registerRequest,
  setPasswordRequest,
  resetPasswordRequest,
  checkTokenRequest,
  imitateUserRequest,
} from './sagas';
import * as uiActions from 'state/ui/actions';

import * as route from 'routes';

describe('auth sagas', () => {
  it('should takeLatest login/logout requests', () => {
    const gen = authSaga();

    expect(gen.next().value).toEqual(
      all([
        takeLatest(types.LOGIN_REQUEST, loginRequest),
        takeLatest(types.LOGOUT_REQUEST, logoutRequest),
        takeLatest(types.REGISTER_REQUEST, registerRequest),
        takeLatest(types.PASSWORD_SET_REQUEST, setPasswordRequest),
        takeLatest(types.PASSWORD_RESET_REQUEST, resetPasswordRequest),
        takeLatest(types.CHECK_TOKEN_REQUEST, checkTokenRequest),
        takeLatest(types.IMITATE_USER_REQUEST, imitateUserRequest),
      ]),
    );
  });

  /* Login */
  it('handles a successful login', () => {
    const user = generateUser();
    const password = 'password';

    return expectSaga(authSaga)
      .provide([
        [matchers.call.fn(authApi.login), user],
        [matchers.call.fn(authApi.addUserToErrorTracking)],
      ])
      .dispatch(actions.loginUser(user.email, password))
      .call(authApi.login, user.email, password)
      .put(usersActions.getUser(user.uid))
      .dispatch({ type: usersTypes.USER_SUCCESS })
      .put({ type: types.LOGIN_SUCCESS, user })
      .call(authApi.addUserToErrorTracking, user)
      .run();
  });

  it('handles a successful login', () => {
    const user = generateUser();
    user.owned_teams = ['Team_123456'];
    user.owned_organizations = null;

    const password = 'password';

    return expectSaga(authSaga)
      .provide([
        [matchers.call.fn(authApi.login), user],
        [matchers.call.fn(authApi.addUserToErrorTracking)],
      ])
      .dispatch(actions.loginUser(user.email, password))
      .call(authApi.login, user.email, password)
      .put(usersActions.getUser(user.uid))
      .dispatch({ type: usersTypes.USER_SUCCESS })
      .put({ type: types.LOGIN_SUCCESS, user })
      .call(authApi.addUserToErrorTracking, user)
      .run();
  });

  it('handles a failed login', () => {
    const user = { email: 'test@example.com', password: 'badpassword' };
    const error = { code: 'auth/invalid-password', message: 'Bad password.' };

    const gen = loginRequest(user);

    expect(gen.next().value).toEqual(
      call(authApi.login, user.email, user.password),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.LOGIN_FAILURE, error }),
    );

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  /* Logout */
  it('handles a successful logout', () => {
    const gen = logoutRequest();

    expect(gen.next().value).toEqual(call(authApi.logout));

    expect(gen.next().value).toEqual(put({ type: types.LOGOUT_SUCCESS }));

    expect(gen.next().value).toEqual(
      put(uiActions.redirectTo(route.toLogin())),
    );

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));

    expect(gen.next().value).toEqual(call(authApi.clearUserFromErrorTracking));
  });

  it('handles a failed logout', () => {
    const error = { code: 'auth/logout-oops', message: 'Something bad.' };

    const gen = logoutRequest();

    expect(gen.next().value).toEqual(call(authApi.logout));

    expect(gen.throw(error).value).toEqual(
      put({ type: types.LOGOUT_FAILURE, error }),
    );
  });

  /* Register */
  it('handles a successful registration', () => {
    const email = 'user@example.com';
    const action = { type: types.REGISTER_REQUEST, email };

    const gen = registerRequest(action);

    expect(gen.next().value).toEqual(call(authApi.register, email));

    expect(gen.next().value).toEqual(
      put({ type: types.REGISTER_SUCCESS, email }),
    );
  });

  it('handles an unsuccessful registration', () => {
    const email = 'user@example.com';
    const error = { code: 'server/404', message: 'Email taken.' };
    const action = { type: types.REGISTER_REQUEST, email };

    const gen = registerRequest(action);

    expect(gen.next().value).toEqual(call(authApi.register, email));

    expect(gen.throw(error).value).toEqual(
      put({ type: types.REGISTER_FAILURE, error }),
    );
  });

  /* Set Password */
  it('handles a successful set password', () => {
    const token = '!!@@jwt.TokenCha.racterS.tring@@!!';
    const user = {
      email: 'someone@perts.net',
      password: 'n3wP@ssw0rd',
    };

    const action = {
      type: types.PASSWORD_SET_REQUEST,
      token,
      password: user.password,
      redirect: 'foo/redirect',
      programLabel: 'ep19',
    };

    const gen = setPasswordRequest(action);

    expect(gen.next().value).toEqual(
      call(authApi.setPassword, action.token, action.password),
    );

    expect(gen.next(user).value).toEqual(
      put({ type: types.PASSWORD_SET_SUCCESS }),
    );

    expect(gen.next().value).toEqual(
      put(actions.loginUser(user.email, action.password, action.redirect)),
    );
  });

  it('handles an unsuccessful set password', () => {
    const token = '!!@@jwt.TokenCha.racterS.tring@@!!';
    const password = 'n3wP@ssw0rd';
    const action = { type: types.PASSWORD_SET_REQUEST, token, password };
    const error = { code: 'server/500', message: 'Bad token.' };

    const gen = setPasswordRequest(action);

    expect(gen.next().value).toEqual(
      call(authApi.setPassword, action.token, action.password),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.PASSWORD_SET_FAILURE, error }),
    );
  });

  /* Reset Password */
  it('handles a successful reset password', () => {
    const email = 'user@example.com';
    const action = { type: types.PASSWORD_RESET_REQUEST, email };

    const gen = resetPasswordRequest(action);

    expect(gen.next().value).toEqual(call(authApi.resetPassword, email));

    expect(gen.next().value).toEqual(
      put({ type: types.PASSWORD_RESET_SUCCESS, email }),
    );
  });

  it('handles an unsuccessful reset password', () => {
    const email = 'user@example.com';
    const error = { code: 'server/404', message: 'Email not found.' };
    const action = { type: types.PASSWORD_RESET_REQUEST, email };

    const gen = resetPasswordRequest(action);

    expect(gen.next().value).toEqual(call(authApi.resetPassword, email));

    expect(gen.throw(error).value).toEqual(
      put({ type: types.PASSWORD_RESET_FAILURE, error }),
    );
  });

  it('handles a successful imitate user', () => {
    const email = 'test@example.com';
    const action = { email };
    const user = { email };

    const gen = imitateUserRequest(action);

    expect(gen.next().value).toEqual(call(authApi.imitateUser, email));

    expect(gen.next(user).value).toEqual(
      put({ type: types.LOGIN_SUCCESS, user }),
    );

    expect(gen.next(user).value).toEqual(
      put(uiActions.redirectTo(route.toLogin())),
    );

    expect(gen.next().value).toEqual(
      call(authApi.addUserToErrorTracking, user),
    );
  });
});
