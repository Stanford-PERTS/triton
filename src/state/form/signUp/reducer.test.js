import reducer from './reducer';
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

  it('should handle REGISTER_FAILURE errors ("email")', () => {
    const error = {
      code: 'register/email',
      message: 'Email already exists.',
    };
    const action = { type: types.REGISTER_FAILURE, error };
    const stateBefore = {
      syncErrors: { email: null, password: null, _form: null },
    };
    const stateAfter = {
      syncErrors: { email: error.message, password: null, _form: null },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle REGISTER_FAILURE generic errors', () => {
    const error = {
      code: 'auth/some-other-error-type',
      message: 'A non-user or password related error occurred.',
    };
    const action = { type: types.REGISTER_FAILURE, error };
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
