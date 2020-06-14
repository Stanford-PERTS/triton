import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';
import keyBy from 'utils/keyBy';

export default (state = initialState, action) => {
  /* eslint complexity: off */
  switch (action.type) {
    // Clear teams flags
    case CLEAR_FLAGS:
      return {
        ...state,
        error: null,
      };

    // Query Teams
    case types.USER_TEAMS_REQUEST:
      return { ...state, loading: true };
    case types.USER_TEAMS_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.teams, 'uid'),
        },
        lastFetched: action.teams.map(team => team.uid),
        links: action.links,
        error: null,
        loading: false,
      };
    case types.USER_TEAMS_FAILURE:
      return {
        ...state,
        byId: {},
        lastFetched: [],
        error: action.error,
        loading: false,
      };

    // Query Teams by Organization
    case types.TEAMS_BY_ORGANIZATION_REQUEST:
      return { ...state, loading: true };
    case types.TEAMS_BY_ORGANIZATION_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.teams, 'uid'),
        },
        error: null,
        loading: false,
      };
    case types.TEAMS_BY_ORGANIZATION_FAILURE:
      return { ...state, error: action.error, loading: false };

    // Get a Team
    case types.TEAM_REQUEST:
    case types.TEAM_ONLY_REQUEST:
      return { ...state, loading: true };
    case types.TEAM_SUCCESS:
    case types.TEAM_ONLY_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.team, 'uid'),
        },
        error: null,
        loading: false,
      };

    case types.TEAM_FAILURE:
    case types.TEAM_ONLY_FAILURE:
      return {
        ...state,
        // If we failed to get the requested team, then return all existing
        // teams and omit the one requested.
        byId: pickBy(state.byId, t => t.uid !== action.teamId),
        error: action.error,
        loading: false,
      };

    // Add a Team
    case types.TEAM_ADD_REQUEST:
      return { ...state, error: null, adding: true };
    case types.TEAM_ADD_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.team, 'uid'),
        },
        teamMode: 'add',
        error: null,
        adding: false,
      };
    case types.TEAM_ADD_FAILURE:
      return {
        ...state,
        error: action.error,
        adding: false,
      };

    // Mode used for TeamDetails page
    case types.TEAM_MODE_SET:
      return {
        ...state,
        teamMode: action.mode,
      };
    case types.TEAM_MODE_RESET:
      return {
        ...state,
        teamMode: '',
      };

    // Update a Team
    case types.TEAM_UPDATE_REQUEST:
    case types.TEAM_REMOVE_ORGANIZATION_REQUEST:
      return { ...state, error: null, updating: true };
    case types.TEAM_UPDATE_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...keyBy(action.team, 'uid'),
        },
        teamMode: 'update',
        error: null,
        updating: false,
      };

    case types.TEAM_UPDATE_FAILURE:
      return {
        ...state,
        error: action.error,
        updating: false,
      };

    // Remove a Team
    case types.TEAM_REMOVE_REQUEST:
      return { ...state, error: null, deleting: true };
    case types.TEAM_REMOVE_SUCCESS:
      return {
        ...state,
        byId: omitBy(state.byId, (_, teamId) => teamId === action.teamId),
        error: null,
        deleting: false,
      };

    case types.TEAM_REMOVE_FAILURE:
      return {
        ...state,
        error: action.error,
        deleting: false,
      };

    default:
      return state;
  }
};
