import reducer, {
  MESSAGE_INVITATION_INVALID,
  MESSAGE_INVITATION_USED,
  MESSAGE_INVITATION_EXPIRED,
} from './reducer';
import * as types from '../../auth/actionTypes';
import deepFreeze from 'deep-freeze';

describe('auth reducer', () => {
  // Init and Default
  // ----------------

  // Initial state is handled by redux-form

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    const stateAfter = { abc: 123, def: 456 };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle used token errors', () => {
    const error = { code: 410, message: 'used 2017-09-16T16:42:47Z' };
    const action = { type: types.CHECK_TOKEN_FAILURE, error };
    const stateBefore = {
      syncErrors: { email: null, password: null, _form: null },
    };
    const stateAfter = {
      syncErrors: {
        email: null,
        password: null,
        _form: MESSAGE_INVITATION_USED,
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle expired token errors', () => {
    const error = { code: 410, message: 'expired' };
    const action = { type: types.CHECK_TOKEN_FAILURE, error };
    const stateBefore = {
      syncErrors: { email: null, password: null, _form: null },
    };
    const stateAfter = {
      syncErrors: {
        email: null,
        password: null,
        _form: MESSAGE_INVITATION_EXPIRED,
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle invalid token errors', () => {
    const error = { code: 401 };
    const action = { type: types.CHECK_TOKEN_FAILURE, error };
    const stateBefore = {
      syncErrors: { email: null, password: null, _form: null },
    };
    const stateAfter = {
      syncErrors: {
        email: null,
        password: null,
        _form: MESSAGE_INVITATION_INVALID,
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle PASSWORD_SET_FAILURE errors', () => {
    const error = {
      code: 'auth/some-other-error-type',
      message: 'A non-user or password related error occurred.',
    };
    const action = { type: types.PASSWORD_SET_FAILURE, error };
    const stateBefore = {
      syncErrors: { email: null, password: null, _form: null },
    };
    const stateAfter = {
      syncErrors: { email: null, password: null, _form: error.message },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
