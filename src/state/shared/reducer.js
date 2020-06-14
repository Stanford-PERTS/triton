import initialState from './initialState';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';

export default (state = initialState, action) => {
  /* eslint complexity: off */
  switch (action.type) {
    case CLEAR_FLAGS: {
      return {
        ...state,
        error: null,
      };
    }

    // The saga will also dispatch:
    // * CLASSROOM_UPDATE_SUCCESS
    // * UPDATE_USER_SUCCESS
    case types.REMOVE_TEAM_USER_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case types.REMOVE_TEAM_USER_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }
    case types.REMOVE_TEAM_USER_FAILURE: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    // The saga will also dispatch:
    // * UPDATE_USER_SUCCESS
    case types.REMOVE_ORGANIZATION_USER_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case types.REMOVE_ORGANIZATION_USER_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }
    case types.REMOVE_ORGANIZATION_USER_FAILURE: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    // The saga will also dispatch:
    // * CLASSROOM_UPDATE_SUCCESS
    // * UPDATE_USER_SUCCESS
    // * REMOVE_TEAM_USER_SUCCESS
    case types.LEAVE_TEAM_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case types.LEAVE_TEAM_SUCCESS: {
      return {
        ...state,
        loading: false,
        // redirect handled by dispatching a separate action,
        // REDIRECT_SET, see state/ui/reducer.redirect.js
        // and state/shared/sagas.js
      };
    }
    case types.LEAVE_TEAM_FAILURE: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    // The saga will also dispatch:
    // * UPDATE_USER_SUCCESS
    // * REMOVE_ORGANIZATION_USER_SUCCESS
    case types.LEAVE_ORGANIZATION_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case types.LEAVE_ORGANIZATION_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }
    case types.LEAVE_ORGANIZATION_FAILURE: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    // The saga will also dispatch:
    // * TEAM_UPDATE_SUCCESS
    // * ORGANIZATION_ADD_SUCCESS
    case types.TEAM_ATTACH_ORGANIZATION_REQUEST: {
      return { ...state, error: null, loading: true };
    }
    case types.TEAM_ATTACH_ORGANIZATION_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }
    case types.TEAM_ATTACH_ORGANIZATION_FAILURE: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    default:
      return state;
  }
};
