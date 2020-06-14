import reducer from './reducer';
import * as types from '../../classrooms/actionTypes';
import deepFreeze from 'deep-freeze';

describe('classroom form reducer', () => {
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

  it('should handle CLASSROOM_ADD_FAILURE generic errors', () => {
    const error = {
      code: 'error/some-error-code',
      message: 'Some user friendly error message.',
    };
    const action = { type: types.CLASSROOM_ADD_FAILURE, error };
    const stateBefore = {
      syncErrors: {
        name: null,
        survey_reminder: false,
        report_reminder: false,
        _form: null,
      },
    };
    const stateAfter = {
      syncErrors: {
        name: null,
        survey_reminder: false,
        report_reminder: false,
        _form: error.message,
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
