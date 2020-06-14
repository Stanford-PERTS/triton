import { actionMethods, actionStages } from 'state/actionTypes';
import * as actions from './actions';
import * as types from './actionTypes';

describe('teams actions', () => {
  const teamId = 'Team_001';
  const team = { uid: teamId, name: 'Go Team 1!' };

  it('should create an action to request teams by org', () => {
    const organizationId = 'Organization_001';
    const expectedAction = {
      actionSlice: 'TEAMS',
      actionOptions: 'BY_ORGANIZATION',
      actionMethod: actionMethods.QUERY,
      actionStage: actionStages.REQUEST,
      type: types.TEAMS_BY_ORGANIZATION_REQUEST,
      organizationId,
    };
    expect(actions.queryTeamsByOrganization(organizationId)).toEqual(
      expectedAction,
    );
  });

  it('should create an action to request a team', () => {
    const expectedAction = {
      actionSlice: 'TEAMS',
      actionMethod: actionMethods.GET,
      actionStage: actionStages.REQUEST,
      actionUids: [teamId],
      type: types.TEAM_REQUEST,
      teamId,
    };
    expect(actions.getTeam(teamId)).toEqual(expectedAction);
  });

  it('should create an action to add new team', () => {
    const expectedAction = {
      type: types.TEAM_ADD_REQUEST,
      team,
    };
    expect(actions.addTeamOnly(team)).toEqual(expectedAction);
  });

  it('should create an action to update a team', () => {
    const expectedAction = {
      type: types.TEAM_UPDATE_REQUEST,
      team,
    };
    expect(actions.updateTeam(team)).toEqual(expectedAction);
  });

  it('should create an action to remove a team', () => {
    const expectedAction = {
      type: types.TEAM_REMOVE_REQUEST,
      team,
    };
    expect(actions.removeTeam(team)).toEqual(expectedAction);
  });

  it('should create an action to reset team mode', () => {
    const expectedAction = {
      type: types.TEAM_MODE_RESET,
    };
    expect(actions.resetTeamMode()).toEqual(expectedAction);
  });

  it('should create an action to set team mode', () => {
    const mode = 'newMode';
    const expectedAction = {
      type: types.TEAM_MODE_SET,
      mode,
    };
    expect(actions.setTeamMode(mode)).toEqual(expectedAction);
  });
});
