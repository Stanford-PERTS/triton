import reducer from './reducer';
import * as types from '../../surveys/actionTypes';
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

  it('should handle SURVEY_UPDATE_FAILURE generic errors', () => {
    const error = {
      code: 'error/some-error-code',
      message: 'Some user friendly error message.',
    };
    const action = { type: types.SURVEY_UPDATE_FAILURE, error };
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
