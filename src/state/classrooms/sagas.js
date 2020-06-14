import { all, call, select, take, takeEvery, put } from 'redux-saga/effects';

import { callWithApiAuthentication } from '../api';
import * as actions from './actions';
import * as cyclesActions from 'state/cycles/actions';
import * as teamActions from 'state/teams/actions';
import * as surveyActions from 'state/surveys/actions';
import * as userActions from 'state/users/actions';
import * as uiActions from 'state/ui/actions';
import * as types from './actionTypes';
import * as cycleActionTypes from 'state/cycles/actionTypes';
import * as teamActionTypes from 'state/teams/actionTypes';
import * as surveyActionTypes from 'state/surveys/actionTypes';
import * as userActionTypes from 'state/users/actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import * as classroomsApi from 'services/triton/classrooms';
import * as route from 'routes';
import selectors from 'state/selectors';
import putAndTakePayload from 'utils/putAndTakePayload';
import toParams from 'utils/toParams';

export function* classroomsQueryByTeam(action) {
  try {
    const classrooms = yield call(
      callWithApiAuthentication,
      classroomsApi.queryByTeam,
      action.teamId,
    );
    yield put(actions.queryClassroomsByTeamSuccess(classrooms, action.teamId));
  } catch (error) {
    yield put(actions.queryClassroomsByTeamFailure(error, action.teamId));
  }
}

export function* classroomsWithParticipationRequest(action) {
  try {
    const classRequest = actions.queryClassroomsByTeam(action.teamId);
    const cycleRequest = cyclesActions.queryCyclesCurrentByTeam(action.teamId);

    const [
      { success: classrooms, failure: classroomsFailure },
      { success: cycle, failure: cycleFailure },
    ] = yield all([
      putAndTakePayload(classRequest),
      putAndTakePayload(
        cycleRequest,
        cyclesActions.queryCyclesCurrentByTeamSuccess().type,
        cyclesActions.queryCyclesCurrentByTeamFailure().type,
      ),
    ]);
    const failure = classroomsFailure || cycleFailure;
    if (failure) {
      throw new Error(failure.error);
    }

    let participationByClassroomId = {};
    if (cycle) {
      const pptResult = yield putAndTakePayload(
        cyclesActions.queryParticipationByTeam(cycle, classrooms),
        cycleActionTypes.CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS,
        cycleActionTypes.CYCLE_QUERY_PARTICIPATION_BY_TEAM_FAILURE,
      );
      if (pptResult.failure) {
        throw new Error(pptResult.failure.error);
      }
      participationByClassroomId = pptResult.success;
    }

    yield put(
      actions.queryClassroomsWithParticipationSuccess(
        classrooms,
        action.teamId,
        participationByClassroomId,
      ),
    );
  } catch (error) {
    yield put(
      actions.queryClassroomsWithParticipationFailure(error, action.teamId),
    );
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* classroomDetailRequest(action) {
  try {
    yield put({ type: types.CLASSROOM_DETAIL_SCENE_REQUEST });
    const userId = yield select(selectors.auth.user.uid);
    yield all([
      put(actions.getClassroom(action.classroomId)),
      put(userActions.getUser(userId)),
      put(teamActions.getTeamOnly(action.teamId)),
      put(surveyActions.queryTeamSurveys(action.teamId)),
    ]);
    const [{ classroom }] = yield all([
      take(types.CLASSROOM_GET_SUCCESS),
      take(userActionTypes.USER_SUCCESS), // make sure to wait for current user
      take(teamActionTypes.TEAM_ONLY_SUCCESS), // and the visible team
      take(surveyActionTypes.SURVEY_BY_TEAM_SUCCESS), // and the survey
    ]);
    const teamId = classroom.team_id;

    // Retrieve cycles so we can get participation
    yield put(cyclesActions.queryCyclesByTeam(classroom.team_id));
    yield take(cycleActionTypes.CYCLES_BY_TEAM_SUCCESS);
    const activeCycle = yield select(selectors.team.cycles.active, { teamId });

    // The remaining requests can run in parallel.
    const toPut = [
      put(cyclesActions.queryParticipationByTeam(activeCycle, [classroom])),
      put(teamActions.queryTeamsByUser()), // all user's teams
      put(userActions.queryUsersByTeam(classroom.team_id)),
    ];
    const toTake = [
      take(cycleActionTypes.CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS),
      take(teamActionTypes.USER_TEAMS_SUCCESS),
      take(userActionTypes.USERS_BY_TEAM_SUCCESS),
    ];

    // Both the visible team and the current user must be in the store for this
    // to work.
    const isOrgAdmin = yield select(selectors.authUser.team.isSupervisor, {
      teamId: classroom.team_id,
    });

    // TODO The selector should be able to handle this, no `if (isOrgAdmin)`
    // needed. Just do:
    //   const orgIds = yield select(...)
    //   orgIds.forEach(/* add to puts and takes */)
    //
    if (isOrgAdmin) {
      const organizationIds = yield select(
        selectors.authUser.team.organizationIds,
        { teamId: classroom.team_id },
      );
      organizationIds.forEach(orgId => {
        toPut.push(put(teamActions.queryTeamsByOrganization(orgId)));
        toTake.push(take(teamActionTypes.TEAMS_BY_ORGANIZATION_SUCCESS));
      });
    }

    yield all(toPut);
    const [
      participation,
      { userTeams },
      { users },
      ...organizationTeamsSuccesses
    ] = yield all(toTake);

    yield put(
      actions.getClassroomDetailSuccess(
        classroom,
        participation,
        users,
        userTeams,
        organizationTeamsSuccesses.map(act => act.teams),
      ),
    );
    yield put({ type: types.CLASSROOM_DETAIL_SCENE_SUCCESS });
  } catch (error) {
    console.error(error);
    yield put(actions.getClassroomDetailFailure(error, action.classroomId));
    yield put({ type: types.CLASSROOM_DETAIL_SCENE_FAILURE });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* classroomRequest(action) {
  try {
    const classroom = yield call(
      callWithApiAuthentication,
      classroomsApi.get,
      action.classroomId,
    );
    yield put(actions.getClassroomSuccess(classroom));
  } catch (error) {
    yield put(actions.getClassroomFailure(error, action.classroomId));
    yield put(uiActions.redirectTo(route.toHomeNoProgram()));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* addClassroomRequest(action) {
  try {
    let classroom = yield callWithApiAuthentication(
      classroomsApi.post,
      action.classroomParams,
    );

    // Need to re-retrieve classroom for updated num_students
    classroom = yield callWithApiAuthentication(
      classroomsApi.get,
      classroom.uid,
    );

    yield put(actions.addClassroomSuccess(classroom));

    let redirect;
    if (action.teamsClassroomsPath) {
      // This case is important for the task list, which nests this scene
      // within the program. See routes like toProgramTeamClassrooms().
      redirect = `${action.teamsClassroomsPath}/${toParams(classroom.uid)}`;
    } else {
      redirect = route.toTeamClassroom(classroom.team_id, classroom.uid);
    }
    yield put(uiActions.redirectTo(redirect));
    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    console.error(error);
    yield put(actions.addClassroomFailure(error));
    yield put(
      uiActions.redirectTo(
        route.toTeamClassrooms(action.classroomParams.team_id),
      ),
    );
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* updateClassroomsRequest(action) {
  try {
    const classBeforeUpdate = yield select(selectors.classroom, {
      classroomId: action.classroom.uid,
    });

    // redirect if...
    const redirect =
      // the team id has changed
      action.classroom.team_id === classBeforeUpdate.team_id
        ? null
        : route.toTeamClassroom(action.classroom.team_id, action.classroom.uid);

    const updatedClassroom = yield call(
      callWithApiAuthentication,
      classroomsApi.update,
      action.classroom,
    );

    yield put(actions.updateClassroomSuccess(updatedClassroom));
    yield put(uiActions.redirectTo(redirect));

    if (redirect) {
      yield put({ type: CLEAR_FLAGS });
    }
  } catch (error) {
    const redirect = route.toTeamClassrooms(action.classroom.team_id);
    yield put(actions.updateClassroomFailure(error, action.classroom.uid));
    yield put(uiActions.redirectTo(redirect));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* classroomRemoveRequest(action) {
  try {
    yield call(
      callWithApiAuthentication,
      classroomsApi.remove,
      action.classroom,
    );
    yield put({
      type: types.CLASSROOM_REMOVE_SUCCESS,
      classroomId: action.classroom.uid,
    });

    const redirect = action.redirect || route.toTeamClassrooms(action.teamId);
    yield put(uiActions.redirectTo(redirect));
    yield put({ type: CLEAR_FLAGS });
  } catch (error) {
    console.error(error);
    yield put({ type: types.CLASSROOM_REMOVE_FAILURE, error });
    yield put(uiActions.redirectTo(route.toTeamClassrooms(action.teamId)));
    yield put({ type: CLEAR_FLAGS });
  }
}

export default function* classroomsSaga() {
  yield all([
    takeEvery(actions.queryClassroomsByTeam().type, classroomsQueryByTeam),
    takeEvery(
      actions.queryClassroomsWithParticipation().type,
      classroomsWithParticipationRequest,
    ),
    takeEvery(types.CLASSROOM_DETAIL_REQUEST, classroomDetailRequest),
    takeEvery(types.CLASSROOM_GET_REQUEST, classroomRequest),
    takeEvery(types.CLASSROOM_ADD_REQUEST, addClassroomRequest),
    takeEvery(types.CLASSROOM_UPDATE_REQUEST, updateClassroomsRequest),
    takeEvery(types.CLASSROOM_REMOVE_REQUEST, classroomRemoveRequest),
  ]);
}
