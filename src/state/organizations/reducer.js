import keyBy from 'utils/keyBy';
import omitBy from 'lodash/omitBy';
import pickBy from 'lodash/pickBy';
import * as types from './actionTypes';
import * as sharedTypes from 'state/shared/actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';

export default (state = initialState, action) => {
  /* eslint complexity: off */
  switch (action.type) {
    // Clear organizations flags
    case CLEAR_FLAGS:
      return {
        ...state,
        error: null,
      };

    // Query Organizations
    case types.ORGANIZATIONS_REQUEST:
      return { ...state, loading: true };
    case types.ORGANIZATIONS_SUCCESS:
      return {
        ...state,
        byId: keyBy(action.organizations, 'uid'),
        lastFetched: action.organizations.map(o => o.uid),
        links: action.links,
        error: null,
        loading: false,
      };
    case types.ORGANIZATIONS_FAILURE:
      return {
        ...state,
        byId: {},
        lastFetched: [],
        error: action.error,
        loading: false,
      };

    // Get Organization
    // Change Organization Code
    // Attach Orgainzation to Team
    case types.ORGANIZATION_REQUEST:
    case types.ORGANIZATION_CODE_REQUEST:
      return { ...state, loading: true };
    case types.ORGANIZATION_SUCCESS:
    case types.ORGANIZATION_CODE_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.organization, 'uid'), // singular
        },
        error: null,
        loading: false,
      };
    case sharedTypes.TEAM_ATTACH_ORGANIZATION_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.organizations, 'uid'), // plural
        },
        error: null,
        loading: false,
      };
    case types.ORGANIZATION_FAILURE:
    case types.ORGANIZATION_CODE_FAILURE:
      return {
        ...state,
        // If we failed to get the requested organization, then return all
        // existing organizations and omit the one requested.
        byId: pickBy(state.byId, o => o.uid !== action.organizationId),
        error: action.error,
        loading: false,
      };

    // Query Organizations by Team
    case types.ORGANIZATIONS_BY_TEAM_REQUEST:
      return { ...state, loading: true };
    case types.ORGANIZATIONS_BY_TEAM_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.organizations, 'uid'),
        },
        error: null,
        loading: false,
      };
    case types.ORGANIZATIONS_BY_TEAM_FAILURE:
      return { ...state, error: action.error, loading: false };

    // Add Organization
    case types.ORGANIZATION_ADD_REQUEST:
      return { ...state, error: null, adding: true };

    case types.ORGANIZATION_ADD_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.organization, 'uid'),
        },
        organizationMode: 'add',
        error: null,
        adding: false,
      };

    case types.ORGANIZATION_ADD_FAILURE:
      return {
        ...state,
        error: action.error,
        adding: false,
      };

    // Mode used for OrganizationDetails page
    case types.ORGANIZATION_MODE_SET:
      return {
        ...state,
        organizationMode: action.mode,
      };

    case types.ORGANIZATION_MODE_RESET:
      return {
        ...state,
        organizationMode: '',
      };

    // Update an Organization
    case types.ORGANIZATION_UPDATE_REQUEST:
      return { ...state, error: null, updating: true };

    case types.ORGANIZATION_UPDATE_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.organization, 'uid'),
        },
        organizationMode: 'update',
        error: null,
        updating: false,
      };

    case types.ORGANIZATION_UPDATE_FAILURE:
      return {
        ...state,
        error: action.error,
        updating: false,
      };

    // Remove an Organization
    case types.ORGANIZATION_REMOVE_REQUEST:
      return { ...state, error: null, deleting: true };
    case types.ORGANIZATION_REMOVE_SUCCESS:
      // Note: the after-deletion redirect is set in
      // state/form/organization/reducer
      return {
        ...state,
        byId: omitBy(
          state.byId,
          (_, organizationId) => organizationId === action.organizationId,
        ),
        error: null,
        deleting: false,
      };
    case types.ORGANIZATION_REMOVE_FAILURE:
      return {
        ...state,
        error: action.error,
        deleting: false,
      };

    default:
      return state;
  }
};
