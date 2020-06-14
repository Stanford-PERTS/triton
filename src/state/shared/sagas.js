import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import putAndTakePayload from 'utils/putAndTakePayload';

import { callWithApiAuthentication } from '../api';
import * as classroomsActions from 'state/classrooms/actions';
import { updateUserRequest } from 'state/users/sagas';
import * as teamsApi from 'services/triton/teams';
import selectors from 'state/selectors';

import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as teamTypes from 'state/teams/actionTypes';
import { clearFlags } from 'state/actions';

import * as route from 'routes';

export function* removeTeamUserRequest(action) {
  try {
    const { team } = action;

    if (action.user) {
      // Make a copy of user object
      const user = {
        ...action.user,
        // Remove team from user's owned teams
        owned_teams: action.user.owned_teams.filter(id => id !== team.uid),
      };
      // Update classrooms user was contact for
      const userTeamClassrooms = yield select(
        selectors.authUser.team.classrooms.list,
        {
          teamId: team.uid,
          userId: user.uid,
        },
      );

      const classrooms = userTeamClassrooms.map(classroom => ({
        ...classroom,
        // Make the team captain the new contact for each classroom
        contact_id: team.captain_id,
      }));
      yield all(classrooms.map(c => put(classroomsActions.updateClassroom(c))));
      // Update user
      yield call(updateUserRequest, { user });

      yield put({
        type: types.REMOVE_TEAM_USER_SUCCESS,
      });
      yield put(clearFlags());
    }
  } catch (error) {
    yield put({
      type: types.REMOVE_TEAM_USER_FAILURE,
      error,
    });
    yield put(clearFlags());
  }
}

export function* removeOrganizationUserRequest(action) {
  try {
    const { organization, user } = action;

    // Make a copy of user object
    const modifiedUser = yield {
      ...user,
      // Remove org from user's owned orgs
      owned_organizations: user.owned_organizations.filter(
        id => id !== organization.uid,
      ),
    };

    const { failure } = yield putAndTakePayload(
      usersActions.updateUser(modifiedUser),
      usersTypes.UPDATE_USER_SUCCESS,
      usersTypes.UPDATE_USER_FAILURE,
    );

    if (failure) {
      throw new Error();
    }

    yield put({ type: types.REMOVE_ORGANIZATION_USER_SUCCESS });
    yield put(clearFlags());
  } catch (error) {
    yield put({
      type: types.REMOVE_ORGANIZATION_USER_FAILURE,
      error,
    });
    yield put(clearFlags());
  }
}

export function* leaveTeamRequest(action) {
  try {
    const { team } = action;
    const user = yield select(selectors.auth.user);
    const program = yield select(selectors.program, { teamId: team.uid });
    yield call(removeTeamUserRequest, { team, user });

    yield put({ type: types.LEAVE_TEAM_SUCCESS });
    yield put(uiActions.redirectTo(route.toHome(program.label)));
    yield put(clearFlags());
  } catch (error) {
    yield put({ type: types.LEAVE_TEAM_FAILURE, error });
  }
}

export function* leaveOrganizationRequest(action) {
  try {
    const { organization } = action;
    const program = yield select(selectors.program, {
      organizationId: organization.uid,
    });
    const user = yield select(selectors.auth.user);
    yield call(removeOrganizationUserRequest, { organization, user });

    yield put({ type: types.LEAVE_ORGANIZATION_SUCCESS });
    yield put(uiActions.redirectTo(route.toHome(program.label)));

    yield put(clearFlags());
  } catch (error) {
    yield put({ type: types.LEAVE_ORGANIZATION_FAILURE, error });
  }
}

export function* teamAttachOrganizationRequest(action) {
  try {
    // Update the team with the new org on the server, returns the org.
    // --------------
    const organizations = yield callWithApiAuthentication(
      teamsApi.attachOrganization,
      action.team,
      action.organizationCode,
    );

    // We'd like to know about the related organization (which the server
    // returned, and we have) as well as the modified team (which it didn't).
    // So get the team from the server.
    yield put({ type: teamTypes.TEAM_REQUEST, teamId: action.team.uid });

    yield put({ type: types.TEAM_ATTACH_ORGANIZATION_SUCCESS, organizations });
  } catch (error) {
    console.error(error);
    const clientError = { ...error };
    if (
      error.message === 'Invalid org code.' ||
      error.message === 'Org must be in same program.'
    ) {
      clientError.message = 'Could not find that code.';
    }
    yield put({
      type: types.TEAM_ATTACH_ORGANIZATION_FAILURE,
      error: clientError,
    });
  }
}

export default function* sharedSaga() {
  yield all([
    takeLatest(types.REMOVE_TEAM_USER_REQUEST, removeTeamUserRequest),
    takeLatest(
      types.REMOVE_ORGANIZATION_USER_REQUEST,
      removeOrganizationUserRequest,
    ),
    takeLatest(types.LEAVE_TEAM_REQUEST, leaveTeamRequest),
    takeLatest(types.LEAVE_ORGANIZATION_REQUEST, leaveOrganizationRequest),
    takeLatest(
      types.TEAM_ATTACH_ORGANIZATION_REQUEST,
      teamAttachOrganizationRequest,
    ),
  ]);
}
