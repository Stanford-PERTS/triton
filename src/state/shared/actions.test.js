import * as actions from './actions';
import * as types from './actionTypes';

describe('shared actions', () => {
  it('should create an action to remove a team user', () => {
    const team = {
      uid: 'TEAM_001',
    };
    const user = {
      uid: 'USER_001',
    };
    const expectedAction = {
      type: types.REMOVE_TEAM_USER_REQUEST,
      team,
      user,
    };

    expect(actions.removeTeamUser(team, user)).toEqual(expectedAction);
  });

  it('should create an action to leave a team', () => {
    const team = {
      uid: 'TEAM_001',
    };
    const expectedAction = {
      type: types.LEAVE_TEAM_REQUEST,
      team,
    };

    expect(actions.leaveTeam(team)).toEqual(expectedAction);
  });
});
