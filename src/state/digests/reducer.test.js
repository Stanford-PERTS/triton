import keyBy from 'utils/keyBy';

import reducer from './reducer';
import * as types from './actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('digest reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no user action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    const stateAfter = { abc: 123, def: 456 };

    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Query digests for user
  it('should handle UNREAD_USER_DIGESTS_REQUEST', () => {
    const userId = 'User_001';
    const action = { type: types.UNREAD_USER_DIGESTS_REQUEST, userId };

    const stateBefore = { byId: {}, error: null, loading: false };
    const stateAfter = { byId: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle ALL_USER_DIGESTS_REQUEST', () => {
    const userId = 'User_001';
    const action = { type: types.ALL_USER_DIGESTS_REQUEST, userId };

    const stateBefore = { byId: {}, error: null, loading: false };
    const stateAfter = { byId: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Update a Digest
  it('should handle UPDATE_DIGEST_REQUEST', () => {
    const action = { type: types.UPDATE_DIGEST_REQUEST };
    const stateBefore = { digest: null, error: null, updating: null };
    const stateAfter = { digest: null, error: null, updating: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle UPDATE_DIGEST_SUCCESS', () => {
    const digests = {
      Digest_00001: { uid: 'Digest_00001', read: false },
      Digest_00002: { uid: 'Digest_00002', read: false },
    };

    const digest = { uid: 'Digest_00001', read: true };
    const action = { type: types.UPDATE_DIGEST_SUCCESS, digest };
    const stateBefore = {
      byId: digests,
      error: null,
      updating: true,
    };
    const stateAfter = {
      byId: {
        ...stateBefore.byId,
        ...keyBy(action.digest, 'uid'),
      },
      error: null,
      updating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle UPDATE_DIGEST_FAILURE', () => {
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.UPDATE_DIGEST_FAILURE, error };
    const stateBefore = { digest: null, error: null, updating: true };
    const stateAfter = { digest: null, error, updating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
