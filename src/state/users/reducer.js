import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import keyBy from 'utils/keyBy';

import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';

export default (state = initialState, action) => {
  /* eslint complexity: off */
  switch (action.type) {
    // Clear teams flags
    case CLEAR_FLAGS:
      return {
        ...state,
        error: null,
      };

    case types.USERS_BY_TEAM_REQUEST:
      return { ...state, error: null, loading: true };
    case types.USERS_BY_TEAM_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.users, u => u.uid),
        },
        error: null,
        loading: false,
      };
    case types.USERS_BY_TEAM_FAILURE:
      return {
        ...state,
        // If we failed to get the requested team's users, then return
        // all existing users and omit the users' associated with the requested
        // team.
        byId: pickBy(state.byId, u => !u.owned_teams.includes(action.teamId)),
        error: action.error,
        loading: false,
      };

    case types.USERS_BY_ORGANIZATION_REQUEST:
      return { ...state, error: null, loading: true };
    case types.USERS_BY_ORGANIZATION_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.users, u => u.uid),
        },
        error: null,
        loading: false,
      };
    case types.USERS_BY_ORGANIZATION_FAILURE:
      return {
        ...state,
        // If we failed to get the requested organization's users, then return
        // all existing users and omit the users' associated with the requested
        // organization.
        byId: pickBy(
          state.byId,
          u => !u.owned_organizations.includes(action.organizationId),
        ),
        error: action.error,
        loading: false,
      };

    case types.USER_REQUEST:
      return { ...state, loading: true };
    case types.USER_SUCCESS:
      return {
        ...state,
        byId: { ...state.byId, ...keyBy(action.user, 'uid') },
        error: null,
        loading: false,
      };
    case types.USER_FAILURE:
      return { ...state, error: action.error, loading: false };

    // Invite Users
    case types.INVITE_USERS_REQUEST:
      return {
        ...state,
        inviteesByEmail: { ...keyBy(action.invitees, 'email') },
        error: null,
        inviting: true,
      };

    case types.INVITE_USERS_SUCCESS:
      return {
        ...state,
        inviteesByEmail: {},
        error: null,
        inviting: false,
      };
    case types.INVITE_USERS_FAILURE:
      return {
        ...state,
        inviteesByEmail: {},
        error: action.error,
        inviting: false,
      };

    case types.INVITE_ORGANIZATION_USER_REQUEST:
      return { ...state, error: null, inviting: true };

    case types.INVITE_ORGANIZATION_USER_SUCCESS:
      return {
        ...state,
        error: null,
        inviting: false,
      };
    case types.INVITE_ORGANIZATION_USER_FAILURE:
      return {
        ...state,
        error: action.error,
        inviting: false,
      };

    // Update User
    case types.UPDATE_USER_REQUEST:
      return { ...state, error: null, updating: true };

    case types.UPDATE_USER_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.user, 'uid'),
        },
        error: null,
        updating: false,
      };

    case types.UPDATE_USER_FAILURE:
      return {
        ...state,
        error: action.error,
        updating: false,
      };

    case types.UPDATE_USERS_REQUEST:
      return {
        ...state,
        updating: true,
      };

    case types.UPDATE_USERS_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.users, u => u.uid),
        },
        updating: false,
      };

    case types.UPDATE_USERS_FAILURE:
      return {
        ...state,
        error: action.error,
        updating: false,
      };

    // User Mode
    case types.USER_MODE_SET:
      return {
        ...state,
        userMode: action.mode,
      };
    case types.USER_MODE_RESET:
      return {
        ...state,
        userMode: '',
      };

    // Stage Invitee
    case types.STAGE_INVITEE:
      return {
        ...state,
        inviteesByEmail: {
          ...state.inviteesByEmail,
          ...keyBy(action.invitee, 'email'),
        },
      };

    case types.UNSTAGE_INVITEE:
      return {
        ...state,
        inviteesByEmail: omitBy(
          state.inviteesByEmail,
          (_, email) => email === action.email,
        ),
      };

    case types.UNSTAGE_INVITEES:
      return {
        ...state,
        inviteesByEmail: {},
      };

    // Verify Users
    case types.VERIFY_USERS_REQUEST:
      return {
        ...state,
        verifying: true,
      };

    case types.VERIFY_USERS_SUCCESS:
      return {
        ...state,
        verifying: false,
        byId: {
          ...state.byId,
          ...keyBy(action.users, u => u.uid),
        },
      };

    case types.VERIFY_USERS_FAILURE:
      return {
        ...state,
        verifying: false,
        error: action.error,
      };

    default:
      return state;
  }
};
