import deepFreeze from 'deep-freeze';

import reducer from './reducer';
import * as types from './actionTypes';
import initialState from './initialState';
import keyBy from 'utils/keyBy';

import { CLEAR_FLAGS } from 'state/actionTypes';

describe('classrooms reducer', () => {
  // Init and Default
  // ----------------
  it('should return the initial state', () => {
    const action = { type: '' };
    expect(reducer(undefined, action)).toEqual(initialState);
  });

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const state = {
      ...initialState,
    };

    deepFreeze(state);

    const expected = state;
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  // Clear Flags
  xit('should handle CLEAR_FLAGS', () => {
    const action = { type: CLEAR_FLAGS };
    const state = {
      ...initialState,
      error: { message: 'some error' },
    };

    deepFreeze(state);

    const expected = {
      ...state,
      error: null,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  // Add Team
  it('should handle CLASSROOM_ADD_REQUEST', () => {
    const action = { type: types.CLASSROOM_ADD_REQUEST };

    const state = {
      ...initialState,
      updating: false,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      updating: true,
      error: null,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle CLASSROOM_ADD_SUCCESS', () => {
    const teamId = 'Team_001';
    const classroomsById = {
      Classroom_001: {
        uid: 'Classroom_001',
        name: 'My Classroom',
        team_id: teamId,
      },
      Classroom_002: {
        uid: 'Classroom_002',
        name: 'Their Classroom',
        team_id: teamId,
      },
    };
    const classroom = { uid: 'Classroom_003', name: 'Foo', team_id: teamId };
    const action = {
      type: types.CLASSROOM_ADD_SUCCESS,
      classroom,
    };

    const state = {
      ...initialState,
      byId: classroomsById,
      updating: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      byId: {
        ...state.byId,
        ...keyBy(action.classroom, 'uid'),
      },
      // classroomMode: 'add',
      error: null,
      updating: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle CLASSROOM_ADD_FAILURE', () => {
    const classroomsById = {
      Classroom_001: { uid: 'Classroom_001', name: 'My Classroom' },
      Classroom_002: { uid: 'Classroom_002', name: 'Their Classroom' },
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = {
      type: types.CLASSROOM_ADD_FAILURE,
      error,
    };

    const state = {
      ...initialState,
      byId: classroomsById,
      error: null,
      updating: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      error,
      updating: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle CLASSROOM_MODE_RESET', () => {
    const action = { type: types.CLASSROOM_MODE_RESET };
    const state = {
      ...initialState,
      classroomMode: 'someMode',
    };

    deepFreeze(state);

    const expected = {
      ...state,
      classroomMode: '',
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  // Update Team
  it('should handle CLASSROOM_UPDATE_REQUEST', () => {
    const action = { type: types.CLASSROOM_UPDATE_REQUEST };
    const state = {
      ...initialState,
      updating: false,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      error: null,
      updating: true,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle CLASSROOM_UPDATE_SUCCESS', () => {
    const teamId = 'Team_001';
    const classroomsById = {
      Classroom_001: {
        uid: 'Classroom_001',
        name: 'My Classroom',
        team_id: teamId,
      },
      Classroom_002: {
        uid: 'Classroom_002',
        name: 'Their Classroom',
        team_id: teamId,
      },
    };
    const classrooms = [{ ...classroomsById.Classroom_001, name: 'Foo' }];
    const action = {
      type: types.CLASSROOM_UPDATE_SUCCESS,
      classrooms,
    };
    const state = {
      ...initialState,
      byId: classroomsById,
      updating: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      byId: {
        ...state.byId,
        ...keyBy(action.classrooms, 'uid'),
      },
      // classroomMode: 'update',
      error: null,
      updating: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle CLASSROOM_UPDATE_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.CLASSROOM_UPDATE_FAILURE, error };
    const state = {
      ...initialState,
      error: null,
      updating: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      error,
      updating: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  // Remove a Classroom
  it('should handle CLASSROOM_REMOVE_REQUEST', () => {
    const classroomId = 'Classroom_002';
    const teamId = 'Team_002';
    const action = {
      type: types.CLASSROOM_REMOVE_REQUEST,
      classroomId,
      teamId,
    };
    const state = {
      ...initialState,
      deleting: false,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      deleting: true,
      error: null,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle a CLASSROOM_REMOVE_SUCCESS, existing classroom', () => {
    const classroomsById = {
      Classroom_001: { uid: 'Classroom_001', name: 'Go Classroom One!' },
      Classroom_002: { uid: 'Classroom_002', name: 'Go Classroom Two!' },
      Classroom_003: { uid: 'Classroom_003', name: 'Go Classroom Three!' },
    };
    const classroomId = 'Classroom_001';
    const teamId = 'Team_001';
    const action = {
      type: types.CLASSROOM_REMOVE_SUCCESS,
      classroomId,
      teamId,
    };
    const state = {
      ...initialState,
      byId: classroomsById,
      deleting: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      byId: {
        Classroom_002: { uid: 'Classroom_002', name: 'Go Classroom Two!' },
        Classroom_003: { uid: 'Classroom_003', name: 'Go Classroom Three!' },
      },
      error: null,
      deleting: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle a CLASSROOM_REMOVE_SUCCESS, non-existing classroom', () => {
    const classroomsById = {
      Classroom_001: { uid: 'Classroom_001', name: 'Go Classroom One!' },
      Classroom_002: { uid: 'Classroom_002', name: 'Go Classroom Two!' },
      Classroom_003: { uid: 'Classroom_003', name: 'Go Classroom Three!' },
    };
    const classroomId = 'Classroom_NONE';
    const teamId = 'Team_NONE';
    const action = {
      type: types.CLASSROOM_REMOVE_SUCCESS,
      classroomId,
      teamId,
    };
    const state = {
      ...initialState,
      byId: classroomsById,
      deleting: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      error: null,
      deleting: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });

  it('should handle a CLASSROOM_REMOVE_FAILURE', () => {
    const classroomsById = {
      Classroom_001: { uid: 'Classroom_001', name: 'Go Classroom One!' },
      Classroom_002: { uid: 'Classroom_002', name: 'Go Classroom Two!' },
      Classroom_003: { uid: 'Classroom_003', name: 'Go Classroom Three!' },
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = {
      type: types.CLASSROOM_REMOVE_FAILURE,
      error,
    };

    const state = {
      ...initialState,
      byId: classroomsById,
      error: null,
      deleting: true,
    };

    deepFreeze(state);

    const expected = {
      ...state,
      error,
      deleting: false,
    };
    const actual = reducer(state, action);

    expect(actual).toEqual(expected);
  });
});
