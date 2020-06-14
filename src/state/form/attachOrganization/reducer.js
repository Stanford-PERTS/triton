import initialState from './initialState';
import { DESTROY_ATTACH_ORGANIZATION_FORM_DATA } from './actionTypes';
import {
  TEAM_ATTACH_ORGANIZATION_REQUEST,
  TEAM_ATTACH_ORGANIZATION_SUCCESS,
  TEAM_ATTACH_ORGANIZATION_FAILURE,
} from '../../shared/actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';

export const attachOrganizationReduxForm = (state = {}, action) => {
  switch (action.type) {
    case TEAM_ATTACH_ORGANIZATION_SUCCESS:
      // https://redux-form.com/6.0.0-alpha.4/docs/faq/howtoclear.md/
      return undefined;
    case TEAM_ATTACH_ORGANIZATION_FAILURE:
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

export const attachOrganizationForm = (state = initialState, action = {}) => {
  switch (action.type) {
    case CLEAR_FLAGS:
      return {
        ...state,
        error: null,
      };
    case TEAM_ATTACH_ORGANIZATION_REQUEST:
      return {
        ...state,
        error: null,
        submitting: true,
        submittedOrganization: null,
      };
    case TEAM_ATTACH_ORGANIZATION_SUCCESS:
      return {
        ...state,
        submitting: false,
        submittedOrganizations: action.organizations.map(o => o.uid),
      };
    case TEAM_ATTACH_ORGANIZATION_FAILURE:
      return {
        ...state,
        error: action.error,
        submitting: false,
        submittedOrganization: null,
      };
    case DESTROY_ATTACH_ORGANIZATION_FORM_DATA:
      return initialState;

    default:
      return state;
  }
};
