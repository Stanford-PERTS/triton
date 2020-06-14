import { all, call, takeEvery, put, take, select } from 'redux-saga/effects';

import * as actions from './actions';
import * as routes from 'routes';
import * as classroomsApi from 'services/triton/classrooms';
import * as classroomsActions from 'state/classrooms/actions';
import * as surveyActions from 'state/surveys/actions';
import * as surveyActionTypes from 'state/surveys/actionTypes';
import * as teamsApi from 'services/triton/teams';
import * as types from './actionTypes';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as uiActions from 'state/ui/actions';
import putAndTakePayload from 'utils/putAndTakePayload';
import selectors from 'state/selectors';
import { callWithApiAuthentication } from '../api';
import { CLEAR_FLAGS, actionMethods, actionStages } from 'state/actionTypes';
import { query } from 'state/actions';

export function* userTeamsRequest(action) {
  try {
    const userUid = yield select(selectors.auth.user.uid);
    const isAdmin = yield select(selectors.auth.user.isAdmin);

    const { teams, links } = yield callWithApiAuthentication(
      teamsApi.query,
      userUid,
      isAdmin,
      action.queryOptions,
    );

    yield put(actions.queryTeamsByUserSuccess(teams, links));
  } catch (error) {
    yield put(actions.queryTeamsByUserFailure(error));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* teamsByOrganizationRequest(action) {
  try {
    const teams = yield callWithApiAuthentication(
      teamsApi.queryByOrganization,
      action.organizationId,
    );

    yield all(teams.map(t => put(surveyActions.queryTeamSurveys(t.uid))));
    yield all(teams.map(t => take(surveyActionTypes.SURVEY_BY_TEAM_SUCCESS)));

    yield put(
      actions.queryTeamsByOrganizationSuccess(teams, action.organizationId),
    );
  } catch (error) {
    yield put(
      actions.queryTeamsByOrganizationFailure(error, action.organizationId),
    );
    yield put({ type: CLEAR_FLAGS });
  }
}

/**
 * A higher-order action/saga (not yet properly labeled as such) initiated when
 * the Team scene mounts. Similar to organizationHomeRequest.
 *
 * - Gets the current team
 * - Gets the program associated with the team
 * - Updates the user to record that they most recently viewed this program
 * - Gets the survey associated with the team.
 *
 * @param {Object} action redux action
 * @yield {Object} action TEAM_SUCCESS
 * @returns {undefined}
 */
export function* teamRequest(action) {
  try {
    const { failure: teamFailure } = yield putAndTakePayload(
      actions.getTeamOnly(action.teamId),
      types.TEAM_ONLY_SUCCESS,
      types.TEAM_ONLY_FAILURE,
    );

    const { failure: programsFailure } = yield putAndTakePayload(
      query('programs'),
    );
    const anyFailure = teamFailure || programsFailure;
    if (anyFailure) {
      throw new Error(anyFailure.error);
    }

    const team = yield select(selectors.team, { teamId: action.teamId });
    const userUid = yield select(selectors.auth.user.uid);

    const updated = { uid: userUid, recent_program_id: team.program_id };
    const { failure: userFailure } = yield putAndTakePayload(
      usersActions.updateUser(updated),
      usersTypes.UPDATE_USER_SUCCESS,
      usersTypes.UPDATE_USER_FAILURE,
    );
    if (userFailure) {
      throw new Error(userFailure.error);
    }

    yield put(surveyActions.queryTeamSurveys(team.uid));

    yield put({
      actionSlice: 'TEAMS',
      actionMethod: actionMethods.GET,
      actionStage: actionStages.SUCCESS,
      actionUids: [team.uid],
      type: types.TEAM_SUCCESS,
      team,
    });
  } catch (error) {
    yield put({
      type: types.TEAM_FAILURE,
      error: String(error),
      teamId: action.teamId,
    });
    yield put(uiActions.redirectTo(routes.toHomeNoProgram()));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* teamOnlyRequest(action) {
  try {
    const team = yield callWithApiAuthentication(teamsApi.get, action.teamId);

    yield put({ type: types.TEAM_ONLY_SUCCESS, team });
  } catch (error) {
    yield put({ type: types.TEAM_ONLY_FAILURE, error, teamId: action.teamId });
    yield put(uiActions.redirectTo(routes.toHomeNoProgram()));

    yield put({ type: CLEAR_FLAGS });
  }
}

export function* teamAddOnlyRequest(action) {
  try {
    const team = yield call(
      callWithApiAuthentication,
      teamsApi.post,
      action.team,
    );
    yield put({ type: types.TEAM_ADD_SUCCESS, team, payload: team });
  } catch (error) {
    console.error(error);
    const clientError = { ...error };
    if (
      error.message === 'Invalid organization_code.' ||
      error.message === 'Org not in the same program.'
    ) {
      clientError.message = 'Could not find that code.';
    }
    yield put({ type: types.TEAM_ADD_FAILURE, error: clientError });
  }
}

export function* teamAddRequest(action) {
  try {
    const { failure: teamFailure, success: team } = yield putAndTakePayload(
      actions.addTeamOnly(action.team, action.adder),
      types.TEAM_ADD_SUCCESS,
      types.TEAM_ADD_FAILURE,
    );
    if (teamFailure) {
      throw new Error(teamFailure);
    }

    // The server will have added the team to the user's ownership list.
    // We can do that ourselves with a quick success action. If the user
    // hasn't been loaded, then it doesn't matter, as it will be correct when
    // fetched from the server.
    const user = yield select(selectors.auth.user);
    if (user) {
      const updated = {
        ...user,
        owned_teams: user.owned_teams.concat(team.uid),
      };
      yield put({ type: usersTypes.UPDATE_USER_SUCCESS, user: updated });
    }

    // Generate a single classroom for this team if "classless" mode is enabled.
    // https://github.com/PERTS/triton/issues/1641
    const program = yield select(selectors.program, { teamId: team.uid });

    if (!program.use_classrooms) {
      // This is not ideal HOA behavior, but the classroom actions/sagas aren't
      // clean enough currently to just dispatch an add-classroom action. It
      // would trigger undesireable redirects.
      const classroom = yield call(
        callWithApiAuthentication,
        classroomsApi.post,
        {
          name: classroomsApi.DEFAULT_CLASSROOM_NAME,
          team_id: team.uid,
          contact_id: team.captain_id,
          program_label: program.label,
        },
      );

      yield put(classroomsActions.addClassroomSuccess(classroom));
    }

    yield put(uiActions.redirectTo(routes.toTeam(team.uid)));
    yield put(actions.addTeamSuccess(team.uid));
  } catch (error) {
    console.error(error);
    yield put(actions.addTeamFailure(error));
  }
}

export function* teamUpdateRequest(action) {
  try {
    // Update team
    const team = yield callWithApiAuthentication(teamsApi.update, action.team);
    yield put({ type: types.TEAM_UPDATE_SUCCESS, team });
  } catch (error) {
    yield put({ type: types.TEAM_UPDATE_FAILURE, error });
  }
}

export function* teamRemoveOrganizationRequest(action) {
  try {
    // Take the id out of the team's orgs.
    const modifiedTeam = yield {
      ...action.team,
      organization_ids: action.team.organization_ids.filter(
        orgId => orgId !== action.organizationId,
      ),
    };

    // Update team
    const team = yield callWithApiAuthentication(teamsApi.update, modifiedTeam);

    yield put({
      type: types.TEAM_UPDATE_SUCCESS,
      team,
    });

    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    yield put({ type: types.TEAM_UPDATE_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* teamRemoveRequest(action) {
  try {
    const program = yield select(selectors.program);
    // Returns 204 with no body, so don't store the response.
    yield callWithApiAuthentication(teamsApi.remove, action.team);

    yield put({ type: types.TEAM_REMOVE_SUCCESS, teamId: action.team.uid });
    yield put(uiActions.redirectTo(routes.toHome(program.label)));

    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    yield put({ type: types.TEAM_REMOVE_FAILURE, error });
    yield put(uiActions.redirectTo(routes.toHomeNoProgram()));

    yield put({ type: CLEAR_FLAGS });
  }
}

export default function* teamsSaga() {
  yield all([
    takeEvery(types.USER_TEAMS_REQUEST, userTeamsRequest),
    takeEvery(types.TEAMS_BY_ORGANIZATION_REQUEST, teamsByOrganizationRequest),
    takeEvery(types.TEAM_REQUEST, teamRequest),
    takeEvery(types.TEAM_ONLY_REQUEST, teamOnlyRequest),
    takeEvery(types.TEAM_ADD_REQUEST, teamAddOnlyRequest),
    takeEvery(types.TEAM_UPDATE_REQUEST, teamUpdateRequest),
    takeEvery(
      types.TEAM_REMOVE_ORGANIZATION_REQUEST,
      teamRemoveOrganizationRequest,
    ),
    takeEvery(types.TEAM_REMOVE_REQUEST, teamRemoveRequest),
    takeEvery(actions.addTeam().type, teamAddRequest),
  ]);
}
