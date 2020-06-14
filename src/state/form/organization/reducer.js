import {
  ORGANIZATION_ADD_FAILURE,
  ORGANIZATION_REMOVE_SUCCESS,
  ORGANIZATION_REMOVE_FAILURE,
} from 'state/organizations/actionTypes';
import * as types from './actionTypes';
import initialState from './initialState';
import { CLEAR_FLAGS } from 'state/actionTypes';

export const organizationReduxForm = (state = {}, action) => {
  switch (action.type) {
    case ORGANIZATION_ADD_FAILURE:
      return {
        ...state,
        syncErrors: {
          ...state.syncErrors,
          _form: action.error.message,
        },
      };

    default:
      return state;
  }
};

export const organizationForm = (state = initialState, action = {}) => {
  switch (action.type) {
    case CLEAR_FLAGS:
      return {
        ...state,
        error: null,
      };
    case types.SUBMIT_ORGANIZATION_FORM_REQUEST:
      return {
        ...state,
        submitting: true,
      };
    case types.SUBMIT_ORGANIZATION_FORM_SUCCESS:
      return {
        ...state,
        submitting: false,
      };
    case types.SUBMIT_ORGANIZATION_FORM_FAILURE:
      return {
        ...state,
        error: action.error,
        submitting: false,
      };

    case types.SUBMIT_NEW_ORGANIZATION_FORM_REQUEST:
      return {
        ...state,
        submitting: true,
      };
    case types.SUBMIT_NEW_ORGANIZATION_FORM_SUCCESS:
      return {
        ...state,
        submitting: false,
      };
    case types.SUBMIT_NEW_ORGANIZATION_FORM_FAILURE:
      return {
        ...state,
        error: action.error,
        submitting: false,
      };

    case ORGANIZATION_REMOVE_SUCCESS:
      return {
        ...state,
      };
    case ORGANIZATION_REMOVE_FAILURE:
      return {
        ...state,
      };

    default:
      return state;
  }
};
