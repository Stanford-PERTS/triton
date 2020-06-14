import pickBy from 'lodash/pickBy';
import omitBy from 'lodash/omitBy';
import keyBy from 'utils/keyBy';
import reducer from './reducer';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('teams reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const state = { abc: 123, def: 456 };

    deepFreeze(state);

    const expected = state;
    const actual = reducer(state, action);
    expect(actual).toEqual(expected);
  });

  // Clear Flags
  it('should handle CLEAR_FLAGS', () => {
    const action = { type: CLEAR_FLAGS };
    const stateBefore = {
      ...initialState,
      error: { message: 'some error' },
    };
    const stateAfter = { ...stateBefore, error: null };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Query Teams by Organization
  it('should handle TEAMS_BY_ORGANIZATION_REQUEST', () => {
    const action = { type: types.TEAMS_BY_ORGANIZATION_REQUEST };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAMS_BY_ORGANIZATION_SUCCESS', () => {
    const teams = [
      { uid: 'Team_001', name: 'Go Team One!' },
      { uid: 'Team_002', name: 'Go Team Two!' },
    ];
    const action = { type: types.TEAMS_BY_ORGANIZATION_SUCCESS, teams };

    const stateBefore = { ...initialState, loading: true };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(teams, 'uid'),
      },
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAMS_BY_ORGANIZATION_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.TEAMS_BY_ORGANIZATION_FAILURE, error };

    const stateBefore = { ...initialState, error: null, loading: true };
    const stateAfter = { ...stateBefore, error, loading: false };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Get a Team
  it('should handle TEAM_REQUEST', () => {
    const action = { type: types.TEAM_REQUEST };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a TEAM_SUCCESS', () => {
    const teamsById = {
      Team_001: { uid: 'Team_001', name: 'Go Team One!' },
      Team_002: { uid: 'Team_002', name: 'Go Team Two!' },
    };
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_SUCCESS, team };

    const stateBefore = { ...initialState, byId: teamsById, loading: false };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(team, 'uid'),
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a TEAM_FAILURE', () => {
    const teamsById = {
      Team_001: { uid: 'Team_001', name: 'Go Team One!' },
      Team_002: { uid: 'Team_002', name: 'Go Team Two!' },
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.TEAM_FAILURE, error };

    const stateBefore = {
      ...initialState,
      teamsById,
      error: null,
      loading: true,
    };
    const stateAfter = {
      ...stateBefore,
      teamsById: pickBy(stateBefore.teamsById, t => t.uid !== action.teamId),
      error,
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Add Team
  it('should handle TEAM_ADD_REQUEST', () => {
    const action = { type: types.TEAM_ADD_REQUEST };

    const stateBefore = { ...initialState, adding: false };
    const stateAfter = { ...stateBefore, error: null, adding: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAM_ADD_SUCCESS', () => {
    const teamsById = {
      Team_001: { uid: 'Team_001', name: 'Go Team One!' },
      Team_002: { uid: 'Team_002', name: 'Go Team Two!' },
    };
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_ADD_SUCCESS, team };

    const stateBefore = {
      ...initialState,
      byId: teamsById,
      adding: true,
    };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(team, 'uid'),
      },
      teamMode: 'add',
      error: null,
      adding: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAM_ADD_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = {
      type: types.TEAM_ADD_FAILURE,
      error,
    };

    const stateBefore = {
      ...initialState,
      error: null,
      adding: true,
    };
    const stateAfter = {
      ...stateBefore,
      error: action.error,
      adding: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAM_MODE_SET', () => {
    const teamMode = 'some_mode';
    const stateBefore = {
      ...initialState,
      teamMode: '',
    };
    const stateAfter = {
      ...stateBefore,
      teamMode,
    };
    const action = { type: types.TEAM_MODE_SET, mode: teamMode };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAM_MODE_RESET', () => {
    const stateBefore = {
      ...initialState,
      teamMode: 'mode',
    };
    const stateAfter = {
      ...stateBefore,
      teamMode: '',
    };
    const action = { type: types.TEAM_MODE_RESET };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Update a Team
  it('should handle TEAM_UPDATE_REQUEST', () => {
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_UPDATE_REQUEST, team };

    const stateBefore = { ...initialState, updating: false };
    const stateAfter = { ...stateBefore, error: null, updating: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a TEAM_UPDATE_SUCCESS', () => {
    const teamsById = {
      Team_001: { uid: 'Team_001', name: 'Go Team One!' },
      Team_002: { uid: 'Team_002', name: 'Go Team Two!' },
    };
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_UPDATE_SUCCESS, team };

    const stateBefore = {
      ...initialState,
      byId: teamsById,
      updating: true,
    };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(team, 'uid'),
      },
      teamMode: 'update',
      error: null,
      updating: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle TEAM_UPDATE_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.TEAM_UPDATE_FAILURE, error };

    const stateBefore = {
      ...initialState,
      error: null,
      updating: true,
    };
    const stateAfter = {
      ...stateBefore,
      error,
      updating: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Remove a Team
  it('should handle TEAM_REMOVE_REQUEST', () => {
    const teamId = 'Team_002';
    const action = { type: types.TEAM_REMOVE_REQUEST, teamId };

    const stateBefore = { ...initialState, deleting: false };
    const stateAfter = { ...stateBefore, error: null, deleting: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a TEAM_REMOVE_SUCCESS', () => {
    const teamsById = {
      Team_001: { uid: 'Team_001', name: 'Go Team One!' },
      Team_002: { uid: 'Team_002', name: 'Go Team Two!' },
      Team_003: { uid: 'Team_003', name: 'Go Team Three!' },
    };
    const teamId = 'Team_001';
    const action = { type: types.TEAM_REMOVE_SUCCESS, teamId };

    const stateBefore = {
      ...initialState,
      byId: teamsById,
      error: null,
      deleting: true,
    };
    const stateAfter = {
      ...stateBefore,
      byId: omitBy(stateBefore.byId, (_, id) => id === teamId),
      error: null,
      deleting: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a TEAM_REMOVE_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.TEAM_REMOVE_FAILURE, error };

    const stateBefore = {
      ...initialState,
      error: null,
      deleting: true,
    };
    const stateAfter = {
      ...stateBefore,
      error,
      deleting: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });
});
