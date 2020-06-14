import map from 'lodash/map';
import zipWith from 'lodash/zipWith';
import { all, takeEvery, takeLatest, put, select } from 'redux-saga/effects';

import * as actions from './actions';
import * as messages from 'state/ui/messages';
import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import * as uiTypes from 'state/ui/actionTypes';
import * as usersApi from 'services/triton/users';
import authApi from 'services/triton/auth';
import generateSagaFunctions from 'state/helpers/generateSagaFunctions';
import selectors from 'state/selectors';
import { actionMethods, actionStages, CLEAR_FLAGS } from 'state/actionTypes';
import { callWithApiAuthentication } from 'state/api';
import fullTypeOfAction from 'state/helpers/fullTypeOfAction';
import { slice } from './';

export function* usersByTeamRequest(action) {
  try {
    const users = yield callWithApiAuthentication(
      usersApi.queryByTeam,
      action.teamId,
    );

    // Verify the users status, i.e. have they accepted their invitations
    const userStatus = yield all([
      ...users.map(user =>
        callWithApiAuthentication(authApi.verify, user.email),
      ),
    ]);
    // Add verified property to user objects
    const verifiedUsers = zipWith(users, userStatus, (user, verified) => ({
      ...user,
      verified,
    }));

    yield put({
      actionSlice: 'USERS',
      actionMethod: actionMethods.QUERY,
      actionOptions: 'BY_TEAM',
      actionStage: actionStages.SUCCESS,
      type: types.USERS_BY_TEAM_SUCCESS,
      teamId: action.teamId,
      users: verifiedUsers,
    });
  } catch (error) {
    yield put({
      type: types.USERS_BY_TEAM_FAILURE,
      teamId: action.teamId,
      error,
    });
  }
}

export function* usersByOrganizationRequest(action) {
  try {
    const users = yield callWithApiAuthentication(
      usersApi.queryByOrganization,
      action.organizationId,
    );

    // Verify the users status, i.e. have they accepted their invitations
    const userStatus = yield all([
      ...users.map(user =>
        callWithApiAuthentication(authApi.verify, user.email),
      ),
    ]);
    // Add verified property to user objects
    const verifiedUsers = zipWith(users, userStatus, (user, verified) => ({
      ...user,
      verified,
    }));

    yield put(
      actions.queryUsersByOrganizationSuccess(
        verifiedUsers,
        action.organizationId,
      ),
    );
  } catch (error) {
    yield put(
      actions.queryUsersByOrganizationFailure(error, action.organizationId),
    );
  }
}

export function* userRequest(action) {
  try {
    const { uid, teamId, email } = action;

    let userRequestFn;
    let userRequestBy;
    if (teamId) {
      // Get one user from a specific team. Used in UserDetails.
      userRequestFn = usersApi.getByTeam;
      userRequestBy = [teamId, uid];
    } else if (email) {
      // Get user based on their email. Used in invitations in TeamDetails.
      userRequestFn = usersApi.getByEmail;
      userRequestBy = [email];
    } else {
      // Get any user by id. Limited to supers, or getting yourself.
      userRequestFn = usersApi.get;
      userRequestBy = [uid];
    }

    const user = yield callWithApiAuthentication(
      userRequestFn,
      ...userRequestBy,
    );
    const verified = yield callWithApiAuthentication(
      authApi.verify,
      user.email,
    );

    yield put(actions.getUserSuccess({ ...user, verified }));
    // yield put({ type: types.USER_SUCCESS, user: { ...user, verified } });

    return user;
  } catch (error) {
    yield put(actions.getUserFailure(error, action.uid));
    yield put({ type: types.USER_FAILURE, error });
    return null;
  }
}

export function* inviteUsersRequest(action) {
  try {
    const { invitees, inviter, team } = action;
    const [invitee] = invitees; // TODO remove after updating all call spots

    if (invitee) {
      yield callWithApiAuthentication(usersApi.invite, invitee, inviter, team);

      // Update list of users for team
      yield usersByTeamRequest({ teamId: action.team.uid });

      yield put({ type: types.INVITE_USERS_SUCCESS });

      yield put({
        type: uiTypes.FLASH_SET,
        flashKey: messages.INVITE_USERS_KEY,
        messageKey: messages.INVITE_USERS_SUCCESS_SINGLE,
      });
    }
  } catch (error) {
    yield put({ type: types.INVITE_USERS_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* inviteOrganizationUserRequest(action) {
  try {
    yield callWithApiAuthentication(
      usersApi.invite,
      action.invitee,
      action.inviter,
      action.organization,
    );

    // Update list of users for team
    yield usersByOrganizationRequest({
      organizationId: action.organization.uid,
    });

    yield put({
      type: types.INVITE_ORGANIZATION_USER_SUCCESS,
    });
  } catch (error) {
    yield put({ type: types.INVITE_ORGANIZATION_USER_FAILURE, error });
    yield put({
      type: CLEAR_FLAGS,
    });
  }
}

export function* updateUserRequest(action) {
  try {
    const user = yield callWithApiAuthentication(usersApi.update, action.user);
    const verified = yield callWithApiAuthentication(
      authApi.verify,
      user.email,
    );
    yield put({
      type: types.UPDATE_USER_SUCCESS,
      user: {
        ...user,
        verified,
      },
    });

    if (action.redirect) {
      yield put(uiActions.redirectTo(action.redirect));
    }

    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    yield put({ type: types.UPDATE_USER_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* updateUsersRequest(action) {
  try {
    const users = yield all([
      ...action.users.map(user => ({
        ...callWithApiAuthentication(usersApi.update, user),
        verified: callWithApiAuthentication(authApi.verify, user.email),
      })),
    ]);

    yield put({ type: types.UPDATE_USERS_SUCCESS, users });
  } catch (error) {
    yield put({ type: types.UPDATE_USERS_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* checkUserExists(action) {
  const { email } = action;
  try {
    // First, check if the user exists in state
    const usersByEmail = yield select(selectors.users.byEmail);
    let user = usersByEmail[email];
    // Then, check server for existence of user
    // Calling api directly instead of using userRequest, so that the error is
    // caught by this function instead of by the userRequest.
    if (!user) {
      user = yield callWithApiAuthentication(usersApi.getByEmail, email);
    }

    // Save the user in the store.
    yield put({ type: types.USER_SUCCESS, user });

    // Dispatch action to update user details form
    yield put({ type: types.CHECK_USER_EXISTS_SUCCESS, user });
  } catch (error) {
    yield put({ type: types.CHECK_USER_EXISTS_FAILURE });
  }
}

export function* verifyUsersRequest(action) {
  try {
    const userStatus = yield all([
      ...action.users.map(user =>
        callWithApiAuthentication(authApi.verify, user.email),
      ),
    ]);
    const users = zipWith(action.users, userStatus, (user, verified) => ({
      ...user,
      verified,
    }));

    yield put({ type: types.VERIFY_USERS_SUCCESS, users });
  } catch (error) {
    yield put({ type: types.VERIFY_USERS_FAILURE, error });
  }
}

const apiCalls = action => ({
  QUERY: {
    BY_ORGANIZATION: [usersApi.queryByOrganization, action.byId],
    BY_TEAM: [usersApi.queryByTeam, action.byId],
  },
});

const sagaFunctions = generateSagaFunctions(apiCalls, slice);
const USERS_QUERY_BY_ORGANIZATON_REQUEST = fullTypeOfAction({
  actionSlice: slice,
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_ORGANIZATION',
  actionStage: actionStages.REQUEST,
});
const USERS_QUERY_BY_TEAM_REQUEST = fullTypeOfAction({
  actionSlice: slice,
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_TEAM',
  actionStage: actionStages.REQUEST,
});

export default function* usersSaga() {
  yield all([
    ...map(sagaFunctions, (fn, type) => takeEvery(type, fn)),
    takeEvery(
      USERS_QUERY_BY_ORGANIZATON_REQUEST,
      sagaFunctions.USERS_QUERY_REQUEST,
    ),
    takeEvery(USERS_QUERY_BY_TEAM_REQUEST, sagaFunctions.USERS_QUERY_REQUEST),
    takeLatest(types.USERS_BY_TEAM_REQUEST, usersByTeamRequest),
    takeLatest(types.USERS_BY_ORGANIZATION_REQUEST, usersByOrganizationRequest),
    takeLatest(types.USER_REQUEST, userRequest),
    takeLatest(types.INVITE_USERS_REQUEST, inviteUsersRequest),
    takeLatest(
      types.INVITE_ORGANIZATION_USER_REQUEST,
      inviteOrganizationUserRequest,
    ),
    takeLatest(types.UPDATE_USER_REQUEST, updateUserRequest),
    takeLatest(types.UPDATE_USERS_REQUEST, updateUsersRequest),
    takeLatest(types.CHECK_USER_EXISTS_REQUEST, checkUserExists),
    takeLatest(types.VERIFY_USERS_REQUEST, verifyUsersRequest),
  ]);
}
