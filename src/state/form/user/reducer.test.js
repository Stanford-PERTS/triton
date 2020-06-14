import reducer from './reducer';
import * as types from 'state/users/actionTypes';
import deepFreeze from 'deep-freeze';

describe('user form reducer', () => {
  // Init and Default
  // ----------------

  // Initial state is handled by redux-form

  it('should return state when no relevant action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    const stateAfter = { abc: 123, def: 456 };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle UPDATE_USER_FAILURE generic errors', () => {
    const error = {
      code: 'error/some-error-code',
      message: 'Some user fiendly error message.',
    };
    const action = { type: types.UPDATE_USER_FAILURE, error };
    const stateBefore = {
      syncErrors: { name: null, email: null, _form: null },
    };
    const stateAfter = {
      syncErrors: { name: null, email: null, _form: error.message },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
