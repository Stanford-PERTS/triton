import { all, call, put, takeLatest } from 'redux-saga/effects';

import * as authActions from 'state/auth/actions';
import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import authApi from 'services/auth';
import putAndTakePayload from 'utils/putAndTakePayload';
import { CLEAR_FLAGS } from 'state/actionTypes';

import * as route from 'routes';

export function* loginRequest(action) {
  try {
    const { email, password } = action;
    const neptuneUser = yield call(authApi.login, email, password);

    const { failure } = yield putAndTakePayload(
      usersActions.getUser(neptuneUser.uid),
      usersTypes.USER_SUCCESS,
      usersTypes.USER_FAILURE,
    );
    if (failure) {
      throw new Error(failure.error);
    }

    // LOGIN_SUCCESS will tell the auth reducer to store the logged in user.
    // Then the toLogin route will be invalid, and UnauthenticatedRoute will
    // take care of redirection, which includes the `continue_url` param.
    yield put({ type: types.LOGIN_SUCCESS, user: neptuneUser });

    yield call(authApi.addUserToErrorTracking, neptuneUser);

    // This may not seem like it's needed, but it is needed for effects from
    // LOGIN_REQUEST action.
    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    yield put({ type: types.LOGIN_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* logoutRequest() {
  try {
    yield call(authApi.logout);
    yield put({ type: types.LOGOUT_SUCCESS });
    yield put(uiActions.redirectTo(route.toLogin()));
    yield put({ type: CLEAR_FLAGS });
    yield call(authApi.clearUserFromErrorTracking);
  } catch (error) {
    yield put({ type: types.LOGOUT_FAILURE, error });
  }
}

export function* registerRequest(action) {
  try {
    yield call(authApi.register, action.email);
    yield put({ type: types.REGISTER_SUCCESS, email: action.email });
  } catch (error) {
    yield put({ type: types.REGISTER_FAILURE, error });
  }
}

export function* setPasswordRequest(action) {
  try {
    const user = yield call(authApi.setPassword, action.token, action.password);
    yield put({ type: types.PASSWORD_SET_SUCCESS });
    // Automatically log the user in after setting/resetting their password.
    yield put(
      authActions.loginUser(user.email, action.password, action.redirect),
    );
  } catch (error) {
    yield put({ type: types.PASSWORD_SET_FAILURE, error });
  }
}

export function* resetPasswordRequest(action) {
  try {
    yield call(authApi.resetPassword, action.email);
    yield put({ type: types.PASSWORD_RESET_SUCCESS, email: action.email });
  } catch (error) {
    yield put({ type: types.PASSWORD_RESET_FAILURE, error });
  }
}

export function* checkTokenRequest(action) {
  try {
    yield call(authApi.checkToken, action.token);
    yield put({ type: types.CHECK_TOKEN_SUCCESS });
  } catch (error) {
    yield put({ type: types.CHECK_TOKEN_FAILURE, error });
  }
}

export function* imitateUserRequest(action) {
  try {
    const user = yield call(authApi.imitateUser, action.email);
    yield put({ type: types.LOGIN_SUCCESS, user });
    yield put(uiActions.redirectTo(route.toLogin()));
    yield call(authApi.addUserToErrorTracking, user);
  } catch (error) {
    yield put({ type: types.LOGIN_FAILURE, error });
  }
}

export default function* authSaga() {
  yield all([
    takeLatest(types.LOGIN_REQUEST, loginRequest),
    takeLatest(types.LOGOUT_REQUEST, logoutRequest),
    takeLatest(types.REGISTER_REQUEST, registerRequest),
    takeLatest(types.PASSWORD_SET_REQUEST, setPasswordRequest),
    takeLatest(types.PASSWORD_RESET_REQUEST, resetPasswordRequest),
    takeLatest(types.CHECK_TOKEN_REQUEST, checkTokenRequest),
    takeLatest(types.IMITATE_USER_REQUEST, imitateUserRequest),
  ]);
}
