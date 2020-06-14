import { actionMethods, actionStages } from 'state/actionTypes';
import * as actions from './actions';
import * as types from './actionTypes';

describe('user actions', () => {
  it('should create an to request users by team id', () => {
    const teamId = 'Team_ABD123';
    const expectedAction = {
      actionSlice: 'USERS',
      actionMethod: actionMethods.QUERY,
      actionOptions: 'BY_TEAM',
      actionStage: actionStages.REQUEST,
      type: types.USERS_BY_TEAM_REQUEST,
      teamId,
    };

    expect(actions.queryUsersByTeam(teamId)).toEqual(expectedAction);
  });

  it('should create an to request users by organization id', () => {
    const organizationId = 'Organization_ABD123';
    const expectedAction = {
      actionSlice: 'USERS',
      actionMethod: actionMethods.QUERY,
      actionOptions: 'BY_ORGANIZATION',
      actionStage: actionStages.REQUEST,
      type: types.USERS_BY_ORGANIZATION_REQUEST,
      organizationId,
    };

    expect(actions.queryUsersByOrganization(organizationId)).toEqual(
      expectedAction,
    );
  });

  it('should create an action to request a user by uid', () => {
    const uid = 'User_Test123';
    const expectedAction = {
      actionSlice: 'USERS',
      actionMethod: actionMethods.GET,
      actionStage: actionStages.REQUEST,
      actionUids: [uid],
      type: types.USER_REQUEST,
      uid,
    };
    expect(actions.getUser(uid)).toEqual(expectedAction);
  });

  it('should create an action to invite users to a team', () => {
    const invitees = [
      {
        name: 'Foo',
        email: 'foo@example.com',
        phoneNumber: '123-123-1234',
      },
    ];
    const inviter = {
      name: 'Bar',
      email: 'bar@example.com',
      phoneNumber: '123-123-1234',
    };
    const team = {
      uid: 'Team_001',
      name: 'Team Foo',
    };
    const expectedAction = {
      type: types.INVITE_USERS_REQUEST,
      invitees,
      inviter,
      team,
    };
    expect(actions.inviteUsers(invitees, inviter, team)).toEqual(
      expectedAction,
    );
  });

  it('should create an action to stage an invitee', () => {
    const invitee = {
      name: 'Foo',
      email: 'foo@example.com',
      phoneNumber: '123-123-1234',
    };
    const expectedAction = {
      type: types.STAGE_INVITEE,
      invitee,
    };
    expect(actions.stageInvitee(invitee)).toEqual(expectedAction);
  });

  it('should create an action to unstage invitee', () => {
    const email = 'foo@example.com';
    const expectedAction = {
      type: types.UNSTAGE_INVITEE,
      email,
    };
    expect(actions.unstageInvitee(email)).toEqual(expectedAction);
  });

  it('should create an action to unstage invitees', () => {
    const expectedAction = {
      type: types.UNSTAGE_INVITEES,
    };
    expect(actions.unstageInvitees()).toEqual(expectedAction);
  });

  it('should create an action to update a user', () => {
    const user = {
      name: 'Foo',
      email: 'foo@example.com',
      phoneNumber: '123-123-1234',
    };
    const redirect = 'some/path';
    const expectedAction = {
      type: types.UPDATE_USER_REQUEST,
      user,
      redirect,
    };
    expect(actions.updateUser(user, redirect)).toEqual(expectedAction);
  });

  it('should create an action to set user mode', () => {
    const mode = 'some mode';
    const expectedAction = {
      type: types.USER_MODE_SET,
      mode,
    };
    expect(actions.setUserMode(mode)).toEqual(expectedAction);
  });

  it('should create an action to reset user mode', () => {
    const expectedAction = {
      type: types.USER_MODE_RESET,
    };
    expect(actions.resetUserMode()).toEqual(expectedAction);
  });

  it('should create an action to check for existing user', () => {
    const email = 'user@example.com';
    const expectedAction = {
      type: types.CHECK_USER_EXISTS_REQUEST,
      email,
    };
    expect(actions.checkUserExists(email)).toEqual(expectedAction);
  });

  it('should create an action to verify user', () => {
    const users = [
      {
        name: 'Foo',
        email: 'foo@example.com',
        phoneNumber: '123-123-1234',
      },
    ];
    const expectedAction = {
      type: types.VERIFY_USERS_REQUEST,
      users,
    };
    expect(actions.verifyUsers(users)).toEqual(expectedAction);
  });
});
