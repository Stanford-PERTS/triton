import reducer from './reducer';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('shared reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no user action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { ...initialState };
    const stateAfter = { ...stateBefore };

    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Clear Flags
  it('should handle CLEAR_FLAGS', () => {
    const action = { type: CLEAR_FLAGS };
    const stateBefore = {
      error: { message: 'some error' },
    };
    const stateAfter = { error: null };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Remove team user
  it('should handle REMOVE_TEAM_USER_REQUEST', () => {
    const team = { uid: 'TEAM_001' };
    const user = { uid: 'USER_001' };
    const action = { type: types.REMOVE_TEAM_USER_REQUEST, team, user };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle REMOVE_TEAM_USER_SUCCESS', () => {
    const action = { type: types.REMOVE_TEAM_USER_SUCCESS };

    const stateBefore = { ...initialState, loading: true };
    const stateAfter = { ...stateBefore, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle REMOVE_TEAM_USER_FAILURE', () => {
    const error = { message: 'some error message' };
    const action = { type: types.REMOVE_TEAM_USER_FAILURE, error };

    const stateBefore = {
      ...initialState,
      error: null,
      loading: true,
    };
    const stateAfter = { ...stateBefore, error, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Leave team user
  it('should handle LEAVE_TEAM_REQUEST', () => {
    const team = { uid: 'TEAM_001' };
    const user = { uid: 'USER_001' };
    const action = { type: types.LEAVE_TEAM_REQUEST, team, user };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle LEAVE_TEAM_SUCCESS', () => {
    const action = { type: types.LEAVE_TEAM_SUCCESS };

    const stateBefore = { ...initialState, loading: true };
    const stateAfter = { ...stateBefore, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle LEAVE_TEAM_FAILURE', () => {
    const error = { message: 'some error message' };
    const action = { type: types.LEAVE_TEAM_FAILURE, error };

    const stateBefore = {
      ...initialState,
      error: null,
      loading: true,
    };
    const stateAfter = { ...stateBefore, error, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Attach organization to team
  it('should handle TEAM_ATTACH_ORGANIZATION_REQUEST', () => {
    const team = { uid: 'Team_001' };
    const organization = { uid: 'Organization_002', code: '123' };
    const action = {
      type: types.TEAM_ATTACH_ORGANIZATION_REQUEST,
      team,
      organizationCode: organization.code,
    };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle TEAM_ATTACH_ORGANIZATION_SUCCESS', () => {
    const action = { type: types.TEAM_ATTACH_ORGANIZATION_SUCCESS };

    const stateBefore = { ...initialState, loading: true };
    const stateAfter = { ...stateBefore, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle TEAM_ATTACH_ORGANIZATION_FAILURE', () => {
    const error = { message: 'some error message' };
    const action = { type: types.TEAM_ATTACH_ORGANIZATION_FAILURE, error };

    const stateBefore = {
      ...initialState,
      error: null,
      loading: true,
    };
    const stateAfter = { ...stateBefore, error, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
