/**
 * In instances where we want to handle possible expired JWT tokens, use the
 * callWithApiAuthentication generator below.
 *
 * Example, instead of:
 *   import { call } from 'redux-saga/effects';
 *   const user = yield call(users.get, uid);
 *
 * Use:
 *   import { callWithApiAuthentication } from '../api';
 *   const user = yield callWithApiAuthentication(users.get, uid);
 *
 * More here: https://github.com/redux-saga/redux-saga/issues/110
 */

import { call, put } from 'redux-saga/effects';
import { AUTH_TOKEN_INVALID } from './actionTypes';
import { LOGOUT_REQUEST } from 'state/auth/actionTypes';

// Always return/throw errors formed as an object with shape
//   {
//     code: 'COMPUTER_FRIENDLY',
//     message: 'HUMAN_FRIENDLY',
//   }
function TritonApiError(error) {
  this.code = error.code;
  this.message = error.message;
}

TritonApiError.prototype = new Error();

export function* callWithApiAuthentication(fn, ...rest) {
  try {
    return yield call(fn, ...rest);
  } catch (error) {
    console.error('callWithApiAuthentication', error);
    // 401: Unauthorized
    // This indicates the JWT token we have sent to the server is either expired
    // or invalid for some other reason. So we'll need to push the user back to
    // login to re-enter their credentials.
    if (error.code === 401) {
      yield put({ type: AUTH_TOKEN_INVALID });
      yield put({ type: LOGOUT_REQUEST });
    }

    throw new TritonApiError(error);
  }
}
