import keyBy from 'utils/keyBy';

import reducer from './reducer';
import * as types from './actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('classrooms reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    expect(reducer(stateBefore, action)).toEqual(stateBefore);
  });

  it('should handle TEAM_REPORTS_REQUEST', () => {
    const action = { type: types.TEAM_REPORTS_REQUEST };
    const stateBefore = { reports: {}, error: null, loading: false };
    const stateAfter = { reports: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle TEAM_REPORTS_SUCCESS', () => {
    const reports = [
      { uid: 'Report_001', filename: '2017-07-31.pdf' },
      { uid: 'Report_002', filename: '2017-08-07.pdf' },
    ];
    const teamId = 'Team_ABC001';
    const action = { type: types.TEAM_REPORTS_SUCCESS, reports, teamId };

    const stateBefore = { reports: {}, error: null, loading: true };
    const stateAfter = {
      reports: keyBy(reports, 'uid'),
      byTeam: {
        [teamId]: { '2017-07-31': [reports[0]], '2017-08-07': [reports[1]] },
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('should handle TEAM_REPORTS_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.TEAM_REPORTS_FAILURE, error };
    const stateBefore = { reports: {}, error: null, loading: true };
    const stateAfter = { reports: {}, error, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
