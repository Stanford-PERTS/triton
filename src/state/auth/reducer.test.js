import reducer from './reducer';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('auth reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    const stateAfter = { abc: 123, def: 456 };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Clear Flags
  it('should handle CLEAR_FLAGS', () => {
    const action = { type: CLEAR_FLAGS };

    const stateBefore = {
      ...initialState,
      error: { message: 'some error' },
    };
    const stateAfter = {
      ...stateBefore,
      error: null,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Login Reducers
  it('should handle LOGIN_REQUEST', () => {
    const action = { type: types.LOGIN_REQUEST };
    const stateBefore = { user: null, authenticating: false };
    const stateAfter = { user: null, authenticating: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle LOGIN_SUCCESS', () => {
    const user = { email: 'test@example.com', name: 'Example User' };
    const action = { type: types.LOGIN_SUCCESS, user };
    const stateBefore = { user: null, error: null, authenticating: true };
    const stateAfter = { user, error: null, authenticating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle LOGIN_FAILURE', () => {
    const error = { code: 'auth/invalid-email', message: 'Bad email address.' };
    const action = { type: types.LOGIN_FAILURE, error };
    const stateBefore = { user: null, error: null, authenticating: true };
    const stateAfter = { user: null, error, authenticating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Logout Reducers
  it('should handle LOGOUT_REQUEST', () => {
    const user = { email: 'test@example.com', name: 'Example User' };
    const action = { type: types.LOGOUT_REQUEST };
    const stateBefore = { user, error: null, authenticating: false };
    const stateAfter = { user, error: null, authenticating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle LOGOUT_SUCCESS', () => {
    const user = { email: 'test@example.com', name: 'Example User' };
    const action = { type: types.LOGOUT_SUCCESS };
    const stateBefore = { user, authenticating: false };
    const stateAfter = { user: null, authenticating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle LOGOUT_FAILURE', () => {
    const error = { code: 'auth/bad-logout', message: 'Something went wrong.' };
    const action = { type: types.LOGOUT_FAILURE, error };
    const stateBefore = { user: null, error: null, authenticating: false };
    const stateAfter = { user: null, error, authenticating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // AuthWrapper
  it('should handle REGISTER_REQUEST', () => {
    const email = 'email@example.com';
    const action = { type: types.REGISTER_REQUEST, email };

    const stateBefore = {
      user: null,
      registrationSuccess: false,
      error: null,
      authenticating: false,
    };
    const stateAfter = {
      user: null,
      registrationSuccess: false,
      error: null,
      authenticating: true,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle REGISTER_SUCCESS', () => {
    const email = 'user@example.com';
    const action = { type: types.REGISTER_SUCCESS, email };

    const stateBefore = {
      user: null,
      registrationSuccess: false,
      error: null,
      authenticating: true,
    };
    const stateAfter = {
      user: null,
      registrationSuccess: email,
      error: null,
      authenticating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle REGISTER_FAILURE', () => {
    const error = { code: 'register/email', message: 'Email already taken.' };
    const action = { type: types.REGISTER_FAILURE, error };

    const stateBefore = {
      user: null,
      registrationSuccess: false,
      error: null,
      authenticating: true,
    };
    const stateAfter = {
      user: null,
      registrationSuccess: false,
      error: action.error,
      authenticating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle REGISTER_RESET', () => {
    const action = { type: types.REGISTER_RESET };

    const stateBefore = {
      user: null,
      registrationSuccess: 'signup@example.com',
      error: null,
      authenticating: false,
    };
    const stateAfter = {
      ...stateBefore,
      registrationSuccess: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Set Password
  it('should handle PASSWORD_SET_REQUEST', () => {
    const token = '!!@@jwt.TokenCha.racterS.tring@@!!';
    const password = 'n3wP@ssw0rd';
    const action = { type: types.PASSWORD_SET_REQUEST, token, password };

    const stateBefore = {
      user: null,
      setPasswordSuccess: false,
      error: null,
      loading: false,
    };
    const stateAfter = {
      ...stateBefore,
      loading: true,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_SET_SUCCESS', () => {
    const action = { type: types.PASSWORD_SET_SUCCESS };

    const stateBefore = {
      user: null,
      setPasswordSuccess: false,
      error: null,
      loading: true,
    };
    const stateAfter = {
      ...stateBefore,
      setPasswordSuccess: true,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_SET_FAILURE', () => {
    const error = { code: 'server/500', message: 'Bad token.' };
    const action = { type: types.PASSWORD_SET_FAILURE, error };

    const stateBefore = {
      user: null,
      setPasswordSuccess: false,
      error: null,
      loading: true,
    };
    const stateAfter = {
      ...stateBefore,
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_SET_RESET', () => {
    const action = { type: types.PASSWORD_SET_RESET };

    const stateBefore = {
      user: null,
      setPasswordSuccess: true,
      error: null,
      loading: false,
    };
    const stateAfter = {
      ...stateBefore,
      setPasswordSuccess: false,
      error: null,
      authenticating: false,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Reset Password
  it('should handle PASSWORD_RESET_REQUEST', () => {
    const action = { type: types.PASSWORD_RESET_REQUEST };

    const stateBefore = {
      user: null,
      resetPasswordSuccess: '',
      error: null,
      authenticating: false,
    };
    const stateAfter = {
      user: null,
      resetPasswordSuccess: '',
      error: null,
      authenticating: true,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_RESET_SUCCESS', () => {
    const email = 'user@example.com';
    const action = { type: types.PASSWORD_RESET_SUCCESS, email };

    const stateBefore = {
      user: null,
      resetPasswordSuccess: '',
      error: null,
      authenticating: true,
    };
    const stateAfter = {
      user: null,
      resetPasswordSuccess: email,
      error: null,
      authenticating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_RESET_FAILURE', () => {
    const error = { code: 'reset/email', message: 'Email does not exist.' };
    const action = { type: types.PASSWORD_RESET_FAILURE, error };

    const stateBefore = {
      user: null,
      resetPasswordSuccess: '',
      error: null,
      authenticating: true,
    };
    const stateAfter = {
      user: null,
      resetPasswordSuccess: '',
      error: action.error,
      authenticating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_RESET_RESET', () => {
    const action = { type: types.PASSWORD_RESET_RESET };

    const stateBefore = {
      user: null,
      resetPasswordSuccess: 'user@example.com',
      error: null,
      authenticating: true,
    };
    const stateAfter = {
      user: null,
      resetPasswordSuccess: '',
      error: null,
      authenticating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
