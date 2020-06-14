import { all, put, select } from 'redux-saga/effects';
import zipWith from 'lodash/zipWith';

import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as actions from './actions';
import { CLEAR_FLAGS, actionMethods, actionStages } from 'state/actionTypes';
import * as uiActions from 'state/ui/actions';
import * as usersApi from 'services/triton/users';
import authApi from 'services/triton/auth';
import selectors from 'state/selectors';
import {
  usersByTeamRequest,
  usersByOrganizationRequest,
  userRequest,
  inviteUsersRequest,
  inviteOrganizationUserRequest,
  updateUserRequest,
  updateUsersRequest,
  checkUserExists,
  verifyUsersRequest,
} from './sagas';

describe('user sagas', () => {
  it('should handle a successful user request by uid', () => {
    const action = {
      type: types.USER_REQUEST,
      uid: 'User_Test123',
    };
    const user = {
      uid: action.uid,
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const verified = true;

    const gen = userRequest(action);

    // should call usersApi.get
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.get, action.uid),
    );
    // should call authApi.verify
    expect(gen.next(user).value).toEqual(
      callWithApiAuthentication(authApi.verify, user.email),
    );

    // should dispatch a USER_SUCCESS
    expect(gen.next(verified).value).toEqual(
      put(actions.getUserSuccess({ ...user, verified })),
    );
  });

  it('should handle a successful user request by email', () => {
    const action = {
      type: types.USER_REQUEST,
      email: 'admin@perts.net',
    };
    const user = {
      uid: 'User_Test123',
      name: 'Aaron Admin',
      email: action.email,
    };
    const verified = true;

    const gen = userRequest(action);

    // should call usersApi.getByEmail
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.getByEmail, user.email),
    );
    // should call authApi.verify
    expect(gen.next(user).value).toEqual(
      callWithApiAuthentication(authApi.verify, user.email),
    );

    // should dispatch a USER_SUCCESS
    expect(gen.next(verified).value).toEqual(
      put(actions.getUserSuccess({ ...user, verified })),
    );
  });

  it('should handle a successful user request by team', () => {
    const action = {
      type: types.USER_REQUEST,
      uid: 'User_Test123',
      teamId: 'Team_Test123',
    };
    const user = {
      uid: action.uid,
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const verified = true;

    const gen = userRequest(action);

    // should call usersApi.getByTeam
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.getByTeam, action.teamId, action.uid),
    );
    // should call authApi.verify
    expect(gen.next(user).value).toEqual(
      callWithApiAuthentication(authApi.verify, user.email),
    );

    // should dispatch a USER_SUCCESS
    expect(gen.next(verified).value).toEqual(
      put(actions.getUserSuccess({ ...user, verified })),
    );
  });

  it('should handle an unsuccessful user request', () => {
    const action = { type: types.USER_REQUEST, uid: 'User_Test123' };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = userRequest(action);

    // should call usersApi.get
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.get, action.uid),
    );

    // should dispatch a USER_FAILURE
    // (eg, in cases where a user isn't authorized to access resource)
    expect(gen.throw(error).value).toEqual(
      put(actions.getUserFailure(error, action.uid)),
    );
  });

  it('should handle a successful users by team request', () => {
    const action = { type: types.USERS_BY_TEAM_REQUEST, teamId: 'Team_001' };
    const users = [
      { uid: 'User_001' },
      { uid: 'User_002' },
      { uid: 'User_003' },
    ];
    const userStatus = [false, false, true];

    const gen = usersByTeamRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.queryByTeam, action.teamId),
    );

    expect(gen.next(users).value).toEqual(
      all([
        ...users.map(user =>
          callWithApiAuthentication(authApi.verify, user.email),
        ),
      ]),
    );

    const verifiedUsers = zipWith(users, userStatus, (user, verified) => ({
      ...user,
      verified,
    }));

    expect(gen.next(userStatus).value).toEqual(
      put({
        actionMethod: actionMethods.QUERY,
        actionOptions: 'BY_TEAM',
        actionSlice: 'USERS',
        actionStage: actionStages.SUCCESS,
        type: types.USERS_BY_TEAM_SUCCESS,
        teamId: action.teamId,
        users: verifiedUsers,
      }),
    );
  });

  it('should handle an unsuccessful users by team request', () => {
    const action = { type: types.USERS_BY_TEAM_REQUEST, teamId: 'Team_001' };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = usersByTeamRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.queryByTeam, action.teamId),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.USERS_BY_TEAM_FAILURE, error, teamId: action.teamId }),
    );
  });

  it('should handle a successful users by organization request', () => {
    const action = {
      type: types.USERS_BY_ORGANIZATION_REQUEST,
      organizationId: 'Organization_001',
    };
    const users = [
      { uid: 'User_001' },
      { uid: 'User_002' },
      { uid: 'User_003' },
    ];
    const userStatus = [false, false, true];

    const gen = usersByOrganizationRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(
        usersApi.queryByOrganization,
        action.organizationId,
      ),
    );

    expect(gen.next(users).value).toEqual(
      all([
        ...users.map(user =>
          callWithApiAuthentication(authApi.verify, user.email),
        ),
      ]),
    );

    const verifiedUsers = zipWith(users, userStatus, (user, verified) => ({
      ...user,
      verified,
    }));

    expect(gen.next(userStatus).value).toEqual(
      put(
        actions.queryUsersByOrganizationSuccess(
          verifiedUsers,
          action.organizationId,
        ),
      ),
    );
  });

  it('should handle an unsuccessful users by organization request', () => {
    const action = {
      type: types.USERS_BY_ORGANIZATION_REQUEST,
      organizationId: 'Organization_001',
    };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = usersByOrganizationRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(
        usersApi.queryByOrganization,
        action.organizationId,
      ),
    );

    expect(gen.throw(error).value).toEqual(
      put(
        actions.queryUsersByOrganizationFailure(error, action.organizationId),
      ),
    );
  });

  it('should handle a successful invite user request', () => {
    const invitee = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const invitees = [invitee];
    const inviter = usersApi.getDefaultUser();
    const team = {
      uid: 'Team_001',
      name: 'Team Foo',
    };
    const action = {
      type: types.INVITE_USERS_REQUEST,
      invitees,
      inviter,
      team,
    };

    const gen = inviteUsersRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.invite, invitee, inviter, action.team),
    );

    expect(gen.next().value).toEqual(
      usersByTeamRequest({ teamId: action.team.uid }),
    );

    expect(gen.next().value).toEqual(put({ type: types.INVITE_USERS_SUCCESS }));

    // expect(gen.next().value).toEqual(
    //   put(uiActions.redirectTo(routes.toTeamUsers(team.uid))),
    // );
  });

  it('should handle an unsuccessful invite user request', () => {
    const invitee = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const invitees = [invitee];
    const inviter = usersApi.getDefaultUser();
    const team = {
      uid: 'Team_001',
      name: 'Team Foo',
    };

    const action = {
      type: types.INVITE_USERS_REQUEST,
      inviter,
      invitees,
      team,
    };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = inviteUsersRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.invite, invitee, inviter, action.team),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.INVITE_USERS_FAILURE, error }),
    );

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle a successful invite organization user request', () => {
    const invitee = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const inviter = usersApi.getDefaultUser();
    const organization = {
      uid: 'Organization_001',
      name: 'Organization Foo',
    };
    const action = {
      type: types.INVITE_USERS_REQUEST,
      invitee,
      inviter,
      organization,
    };

    const gen = inviteOrganizationUserRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(
        usersApi.invite,
        action.invitee,
        action.inviter,
        action.organization,
      ),
    );

    expect(gen.next().value).toEqual(
      usersByOrganizationRequest({ organizationId: action.organization.uid }),
    );

    expect(gen.next().value).toEqual(
      put({ type: types.INVITE_ORGANIZATION_USER_SUCCESS }),
    );
  });

  it('should handle an unsuccessful invite organization user request', () => {
    const invitee = [
      {
        name: 'Aaron Admin',
        email: 'admin@perts.net',
      },
    ];
    const inviter = usersApi.getDefaultUser();
    const organization = {
      uid: 'Organization_001',
      name: 'Organization Foo',
    };
    const action = {
      type: types.INVITE_ORGANIZATION_USER_REQUEST,
      invitee,
      inviter,
      organization,
    };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = inviteOrganizationUserRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(
        usersApi.invite,
        action.invitee,
        action.inviter,
        action.organization,
      ),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.INVITE_ORGANIZATION_USER_FAILURE, error }),
    );

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle a successful update user request', () => {
    const user = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const redirect = 'some/path';
    const verified = true;
    const action = { type: types.UPDATE_USER_REQUEST, user, redirect };

    const gen = updateUserRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.update, action.user),
    );
    expect(gen.next(user).value).toEqual(
      callWithApiAuthentication(authApi.verify, action.user.email),
    );

    expect(gen.next(verified).value).toEqual(
      put({ type: types.UPDATE_USER_SUCCESS, user: { ...user, verified } }),
    );

    expect(gen.next().value).toEqual(put(uiActions.redirectTo(redirect)));

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle an unsuccessful update user request', () => {
    const user = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const action = { type: types.UPDATE_USER_REQUEST, user };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = updateUserRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(usersApi.update, action.user),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.UPDATE_USER_FAILURE, error }),
    );
    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle a successful update users request', () => {
    const users = [
      {
        name: 'Aaron Admin',
        email: 'admin@perts.net',
      },
    ];
    const action = { type: types.UPDATE_USERS_REQUEST, users };

    const gen = updateUsersRequest(action);

    expect(gen.next().value).toEqual(
      all([
        ...users.map(user => ({
          ...callWithApiAuthentication(usersApi.update, user),
          verified: callWithApiAuthentication(authApi.verify, user.email),
        })),
      ]),
    );

    expect(gen.next(users).value).toEqual(
      put({ type: types.UPDATE_USERS_SUCCESS, users }),
    );
  });

  it('should handle an unsuccessful update users request', () => {
    const users = [
      {
        name: 'Aaron Admin',
        email: 'admin@perts.net',
      },
    ];
    const action = { type: types.UPDATE_USERS_REQUEST, users };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = updateUsersRequest(action);

    expect(gen.next(users).value).toEqual(
      all([
        ...users.map(user => ({
          ...callWithApiAuthentication(usersApi.update, user),
          verified: callWithApiAuthentication(authApi.verify, user.email),
        })),
      ]),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.UPDATE_USERS_FAILURE, error }),
    );
  });

  it('succeeds for check user exists request when user found in state', () => {
    const user = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const usersByEmail = {
      'admin@perts.net': user,
    };
    const action = { type: types.CHECK_USER_EXISTS_REQUEST, email: user.email };
    const gen = checkUserExists(action);

    expect(gen.next().value).toEqual(select(selectors.users.byEmail));
    // If user found in state skip api call
    expect(gen.next(usersByEmail).value).toEqual(
      put({ type: types.USER_SUCCESS, user }),
    );
    expect(gen.next().value).toEqual(
      put({ type: types.CHECK_USER_EXISTS_SUCCESS, user }),
    );
  });

  it('succeeds for check user exists request when user not found', () => {
    const user = {
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const usersByEmail = {
      'user@example.com': {
        name: 'Some User',
        email: 'user@example.com',
      },
    };
    const action = { type: types.CHECK_USER_EXISTS_REQUEST, email: user.email };
    const gen = checkUserExists(action);

    expect(gen.next().value).toEqual(select(selectors.users.byEmail));
    // If user NOT found in state, it will trigger api call
    expect(gen.next(usersByEmail).value).toEqual(
      callWithApiAuthentication(usersApi.getByEmail, user.email),
    );
    expect(gen.next(user).value).toEqual(
      put({ type: types.USER_SUCCESS, user }),
    );
    expect(gen.next().value).toEqual(
      put({ type: types.CHECK_USER_EXISTS_SUCCESS, user }),
    );
  });

  it('should handle a successful verify users request', () => {
    const users = [
      {
        name: 'Aaron Admin',
        email: 'admin@perts.net',
      },
    ];
    const userStatus = [true];
    const action = { type: types.VERIFY_USERS_REQUEST, users };

    const gen = verifyUsersRequest(action);

    expect(gen.next().value).toEqual(
      all([
        ...users.map(user =>
          callWithApiAuthentication(authApi.verify, user.email),
        ),
      ]),
    );

    const verifiedUsers = zipWith(
      action.users,
      userStatus,
      (user, verified) => ({
        ...user,
        verified,
      }),
    );

    expect(gen.next(userStatus).value).toEqual(
      put({ type: types.VERIFY_USERS_SUCCESS, users: verifiedUsers }),
    );
  });

  it('should handle an unsuccessful verify users request', () => {
    const users = [
      {
        name: 'Aaron Admin',
        email: 'admin@perts.net',
      },
    ];
    const action = { type: types.VERIFY_USERS_REQUEST, users };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = verifyUsersRequest(action);

    expect(gen.next().value).toEqual(
      all([
        ...users.map(user =>
          callWithApiAuthentication(authApi.verify, user.email),
        ),
      ]),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.VERIFY_USERS_FAILURE, error }),
    );
  });
});
