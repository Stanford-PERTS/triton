import * as actions from './actions';
import * as types from './actionTypes';

describe('report actions', () => {
  it('should create an action to request team reports', () => {
    const teamId = 'Team_001';
    const expectedAction = {
      type: types.TEAM_REPORTS_REQUEST,
      teamId,
    };
    expect(actions.getTeamReports(teamId)).toEqual(expectedAction);
  });
});
