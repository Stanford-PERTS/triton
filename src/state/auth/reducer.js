import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';
import pickFromDefaults from 'utils/pickFromDefaults';

export function createReducer(initializeWith = {}) {
  return function(
    state = pickFromDefaults(initialState, initializeWith),
    action = {},
  ) {
    /* eslint complexity: off */
    switch (action.type) {
      case CLEAR_FLAGS:
        return {
          ...state,
          error: null,
        };
      case types.LOGIN_REQUEST:
        return {
          ...state,
          authenticating: true,
        };
      case types.LOGIN_SUCCESS:
        return {
          ...state,
          user: action.user,
          error: null,
          authenticating: false,
        };
      case types.LOGIN_FAILURE:
        return {
          ...state,
          user: null,
          error: action.error,
          authenticating: false,
        };

      case types.LOGOUT_REQUEST:
        return state;
      case types.LOGOUT_SUCCESS:
        return {
          ...state,
          user: null,
          authenticating: false,
        };
      case types.LOGOUT_FAILURE:
        return {
          ...state,
          error: action.error,
          authenticating: false,
        };

      case types.REGISTER_REQUEST:
        return {
          ...state,
          registrationSuccess: false,
          error: null,
          authenticating: true,
        };
      case types.REGISTER_SUCCESS:
        return {
          ...state,
          registrationSuccess: action.email,
          error: null,
          authenticating: false,
        };
      case types.REGISTER_FAILURE:
        return {
          ...state,
          registrationSuccess: false,
          error: action.error,
          authenticating: false,
        };
      case types.REGISTER_RESET:
        return {
          ...state,
          registrationSuccess: false,
          error: null,
          authenticating: false,
        };

      case types.PASSWORD_SET_REQUEST:
        return {
          ...state,
          setPasswordSuccess: false,
          error: null,
          loading: true,
        };
      case types.PASSWORD_SET_SUCCESS:
        return {
          ...state,
          setPasswordSuccess: true,
          error: null,
          loading: false,
        };
      case types.PASSWORD_SET_FAILURE:
        return {
          ...state,
          setPasswordSuccess: false,
          error: action.error,
          loading: false,
        };
      case types.PASSWORD_SET_RESET:
        return {
          ...state,
          setPasswordSuccess: false,
          error: null,
          authenticating: false,
          loading: false,
        };

      case types.PASSWORD_RESET_REQUEST:
        return {
          ...state,
          resetPasswordSuccess: '',
          error: null,
          authenticating: true,
        };
      case types.PASSWORD_RESET_SUCCESS:
        return {
          ...state,
          resetPasswordSuccess: action.email,
          error: null,
          authenticating: false,
        };
      case types.PASSWORD_RESET_FAILURE:
        return {
          ...state,
          resetPasswordSuccess: '',
          error: action.error,
          authenticating: false,
        };
      case types.PASSWORD_RESET_RESET:
        return {
          ...state,
          resetPasswordSuccess: '',
          error: null,
          authenticating: false,
        };

      default:
        return state;
    }
  };
}

export default createReducer();
