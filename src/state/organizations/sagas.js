import { all, takeLatest, put, select } from 'redux-saga/effects';

import * as route from 'routes';
import * as types from './actionTypes';

import * as actions from 'state/actions';
import * as organizationsActions from 'state/organizations/actions';
import * as organizationsApi from 'services/triton/organizations';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as uiActions from 'state/ui/actions';

import putAndTakePayload from 'utils/putAndTakePayload';
import selectors from 'state/selectors';
import { callWithApiAuthentication } from '../api';
import { CLEAR_FLAGS } from 'state/actionTypes';

export function* organizationsRequest(action) {
  try {
    const userUid = yield select(selectors.auth.user.uid);
    const isAdmin = yield select(selectors.auth.user.isAdmin);

    const { organizations, links } = yield callWithApiAuthentication(
      organizationsApi.query,
      userUid,
      isAdmin,
      action.queryOptions,
    );

    yield put(
      organizationsActions.queryOrganizationsSuccess(organizations, links),
    );
  } catch (error) {
    yield put(organizationsActions.queryOrganizationsFailure(error));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* organizationRequest(action) {
  try {
    const organization = yield callWithApiAuthentication(
      organizationsApi.get,
      action.organizationId,
    );

    yield put(organizationsActions.getOrganizationSuccess(organization));
  } catch (error) {
    const redirect = route.toHomeNoProgram();
    yield put(
      organizationsActions.getOrganizationFailure(error, action.organizationId),
    );
    yield put(uiActions.redirectTo(redirect));
    yield put({ type: CLEAR_FLAGS });
  }
}

/**
 * A higher-order action/saga (not yet properly labeled as such) initiated when
 * the Organization scene mounts. Similar to teamRequest.
 *
 * - Gets the current organization
 * - Gets the program associated with the org
 * - Updates the user to record that they most recently viewed this program
 *
 * @param {Object} action redux action
 * @yield {Object} action TEAM_SUCCESS
 * @returns {undefined}
 */
export function* organizationHomeRequest(action) {
  try {
    const { orgFailure } = yield putAndTakePayload(
      organizationsActions.getOrganization(action.organizationId),
      types.ORGANIZATION_SUCCESS,
      types.ORGANIZATION_FAILURE,
    );
    const { programsFailure } = yield putAndTakePayload(
      actions.query('programs'),
    );
    const anyFailure = orgFailure || programsFailure;
    if (anyFailure) {
      throw new Error(anyFailure.error);
    }

    const org = yield select(selectors.organization, {
      organizationId: action.organizationId,
    });
    const userUid = yield select(selectors.auth.user.uid);

    const updated = { uid: userUid, recent_program_id: org.program_id };
    const { failure: userFailure } = yield putAndTakePayload(
      usersActions.updateUser(updated),
      usersTypes.UPDATE_USER_SUCCESS,
      usersTypes.UPDATE_USER_FAILURE,
    );
    if (userFailure) {
      throw new Error(userFailure.error);
    }

    yield put({ type: types.ORGANIZATION_HOME_SUCCESS });
  } catch (error) {
    yield put({ type: types.ORGANIZATION_HOME_FAILURE, error: String(error) });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* organizationsByTeamRequest(action) {
  try {
    const organizations = yield callWithApiAuthentication(
      organizationsApi.queryByTeam,
      action.teamId,
    );

    yield put({ type: types.ORGANIZATIONS_BY_TEAM_SUCCESS, organizations });
  } catch (error) {
    yield put({ type: types.ORGANIZATIONS_BY_TEAM_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* organizationAddRequest(action) {
  try {
    const organization = yield callWithApiAuthentication(
      organizationsApi.post,
      action.organization,
    );

    yield put({
      type: types.ORGANIZATION_ADD_SUCCESS,
      organization,
    });

    yield put({ type: CLEAR_FLAGS });

    return organization;
  } catch (error) {
    yield put({
      type: types.ORGANIZATION_ADD_FAILURE,
      error,
    });
    yield put({ type: CLEAR_FLAGS });
    return undefined;
  }
}

export function* organizationUpdateRequest(action) {
  try {
    const organization = yield callWithApiAuthentication(
      organizationsApi.update,
      action.organization,
    );

    yield put({ type: types.ORGANIZATION_UPDATE_SUCCESS, organization });
  } catch (error) {
    yield put({
      type: types.ORGANIZATION_UPDATE_FAILURE,
      error,
    });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* organizationCodeRequest(action) {
  try {
    const organization = yield callWithApiAuthentication(
      organizationsApi.changeCode,
      action.organizationId,
    );

    yield put({ type: types.ORGANIZATION_CODE_SUCCESS, organization });
  } catch (error) {
    yield put({
      type: types.ORGANIZATION_CODE_FAILURE,
      error,
      organizationId: action.organizationId,
    });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* organizationRemoveRequest(action) {
  try {
    // Get a reference to this before the org is removed from the store.
    const program = yield select(selectors.program, {
      organizationId: action.organizationId,
    });

    yield callWithApiAuthentication(
      organizationsApi.remove,
      action.organizationId,
    );
    yield put({
      type: types.ORGANIZATION_REMOVE_SUCCESS,
      organizationId: action.organizationId,
    });

    yield put(uiActions.redirectTo(route.toHome(program.label)));
    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    yield put({
      type: types.ORGANIZATION_REMOVE_FAILURE,
      organizationId: action.organizationId,
      error,
    });
    yield put(uiActions.redirectTo(route.toHomeNoProgram()));

    yield put({ type: CLEAR_FLAGS });
  }
}

export function* organizationDashboardRequest(action) {
  const { organizationId } = action;

  try {
    const dashboard = yield callWithApiAuthentication(
      organizationsApi.queryDashboard,
      organizationId,
    );

    yield put(actions.querySuccess('classrooms', dashboard.classrooms));
    yield put(actions.querySuccess('cycles', dashboard.cycles));
    yield put(actions.querySuccess('responses', dashboard.responses));
    yield put(actions.querySuccess('teams', dashboard.teams));
    yield put(actions.querySuccess('users', dashboard.users));

    yield put(
      organizationsActions.queryOrganizationDashboardSuccess(organizationId),
    );
  } catch (error) {
    yield put(
      organizationsActions.queryOrganizationDashboardFailure(
        organizationId,
        error,
      ),
    );
  }
}

export default function* organizationsSaga() {
  yield all([
    takeLatest(types.ORGANIZATIONS_REQUEST, organizationsRequest),
    takeLatest(types.ORGANIZATION_REQUEST, organizationRequest),
    takeLatest(types.ORGANIZATION_HOME_REQUEST, organizationHomeRequest),
    takeLatest(types.ORGANIZATIONS_BY_TEAM_REQUEST, organizationsByTeamRequest),
    takeLatest(types.ORGANIZATION_ADD_REQUEST, organizationAddRequest),
    takeLatest(types.ORGANIZATION_UPDATE_REQUEST, organizationUpdateRequest),
    takeLatest(types.ORGANIZATION_CODE_REQUEST, organizationCodeRequest),
    takeLatest(types.ORGANIZATION_REMOVE_REQUEST, organizationRemoveRequest),
    takeLatest(
      organizationsActions.queryOrganizationDashboard().type,
      organizationDashboardRequest,
    ),
  ]);
}
