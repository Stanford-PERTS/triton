import { all, takeEvery, call, put, select, take } from 'redux-saga/effects';
import { callWithApiAuthentication } from '../api';
import forEach from 'lodash/forEach';

import * as actions from './actions';
import * as classroomsApi from 'services/triton/classrooms';
import * as classroomTypes from 'state/classrooms/actionTypes';
import * as completionApi from 'services/triton/completion';
import * as cyclesApi from 'services/triton/cycles';
import * as messages from 'state/ui/messages';
import * as participantActions from 'state/participants/actions';
import * as participationApi from 'services/triton/participation';
import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import * as uiTypes from 'state/ui/actionTypes';
import putAndTakePayload from 'utils/putAndTakePayload';
import selectors from 'state/selectors';
import { CLEAR_FLAGS } from 'state/actionTypes';

import * as routes from 'routes';

export function* cyclesByTeamRequest(action) {
  try {
    // @todo HACK: this classroom loading should happen as part of a high-order
    //     action for the TeamSchedule scene. It's necessary to query
    //     participation later.
    const [classrooms, cycles] = yield all([
      callWithApiAuthentication(classroomsApi.queryByTeam, action.teamId),
      callWithApiAuthentication(cyclesApi.queryByTeam, action.teamId),
    ]);

    yield put({ type: classroomTypes.TEAM_CLASSROOMS_SUCCESS, classrooms });
    yield put({ type: types.CYCLES_BY_TEAM_SUCCESS, cycles });
  } catch (error) {
    yield put({ type: types.CYCLES_BY_TEAM_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* cyclesCurrentByTeamRequest(action) {
  try {
    const cycle = yield callWithApiAuthentication(
      cyclesApi.getByTeamCurrent,
      action.teamId,
    );

    // Cycle may be null if there is no current cycle for this team. Translate
    // this into an empty array for Redux, otherwise it will try to treat null
    // as an object and get into trouble.

    yield put(actions.queryCyclesCurrentByTeamSuccess(cycle || []));
  } catch (error) {
    yield put(actions.queryCyclesCurrentByTeamFailure(error, action.teamId));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* getCycle(action) {
  try {
    const cycle = yield call(
      callWithApiAuthentication,
      cyclesApi.get,
      action.cycleId,
    );

    yield put({ type: types.CYCLES_GET_SUCCESS, cycle });
  } catch (error) {
    yield put({
      type: types.CYCLES_GET_FAILURE,
      error,
      cycleId: action.cycleId,
    });
    yield put(uiActions.redirectTo(routes.toHomeNoProgram()));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* addCycle(action) {
  try {
    const response = yield call(
      callWithApiAuthentication,
      cyclesApi.post,
      action.cycle,
    );
    // Because the server performs a recalculation of cycle ordinals, the
    // response will contain both the new cycle and a full array of the team
    // cycles so that we can update on the client.
    const cycle = response.data;
    const teamCycles = response.team_cycles;

    yield put({ type: types.CYCLE_ADD_SUCCESS, cycle });
    yield put({ type: types.CYCLES_BY_TEAM_SUCCESS, cycles: teamCycles });
    yield put(
      uiActions.redirectTo(
        routes.toProgramStep(cycle.team_id, 'cycle', cycle.uid),
      ),
    );
  } catch (error) {
    yield put({ type: types.CYCLE_ADD_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* updateCycle(action) {
  try {
    const response = yield call(
      callWithApiAuthentication,
      cyclesApi.update,
      action.cycle,
    );

    // Because the server performs a recalculation of cycle ordinals, the
    // response will contain both the new cycle and a full array of the team
    // cycles so that we can update on the client.
    const cycle = response.data;
    const teamCycles = response.team_cycles;

    // yield put({ type: types.CYCLE_UPDATE_SUCCESS, cycle });
    yield put(actions.updateCycleSuccess(cycle));
    yield put({ type: types.CYCLES_BY_TEAM_SUCCESS, cycles: teamCycles });

    // Requery since cycle date changes might affect participation data and we
    // want to update the ui right away.
    const props = { teamId: cycle.team_id };
    const classrooms = yield select(selectors.team.classrooms.list, props);
    yield put(actions.queryParticipationByTeam(cycle, classrooms));
    yield take(actions.queryParticipationByTeamSuccess().type);
  } catch (error) {
    // yield put({ type: types.CYCLE_UPDATE_FAILURE, error });
    yield put(actions.updateCycleFailure(error, action.cycle));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* removeCycle(action) {
  try {
    const response = yield call(
      callWithApiAuthentication,
      cyclesApi.remove,
      action.cycle.uid,
    );

    // Because the server performs a recalculation of cycle ordinals, the
    // response will contain both the new cycle and a full array of the team
    // cycles so that we can update on the client.
    const teamCycles = response.team_cycles;

    yield put({ type: types.CYCLES_BY_TEAM_SUCCESS, cycles: teamCycles });
    yield put({ type: types.CYCLE_REMOVE_SUCCESS, cycle: action.cycle });

    // Since we are deleting the currently visible schedule, we'll just redirect
    // back to the main team schedule scene and let it recalculate which cycle,
    // if any, to display to the user.
    yield put(
      uiActions.redirectTo(routes.toProgramSteps(action.cycle.team_id)),
    );

    yield put({
      type: uiTypes.FLASH_SET,
      flashKey: messages.CYCLE_REMOVE_SUCCESS_KEY,
      messageKey: messages.CYCLE_REMOVE_SUCCESS_MSG,
    });
  } catch (error) {
    yield put({ type: types.CYCLE_REMOVE_FAILURE, error });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* participationByTeamRequest(action) {
  try {
    const noClassrooms = !action.classrooms || action.classrooms.length === 0;
    const notScheduled =
      !action.cycle || !action.cycle.start_date || !action.cycle.end_date;

    if (noClassrooms || notScheduled) {
      yield put(actions.queryParticipationByTeamSuccess(action.cycle.uid, {}));
      return;
    }

    const participation = yield callWithApiAuthentication(
      participationApi.queryByClassrooms,
      action.classrooms,
      action.cycle.start_date,
      action.cycle.extended_end_date || action.cycle.end_date,
    );

    const participationByClassroomId = {};
    forEach(action.classrooms, c => {
      const classroomCode = c.code.replace(/ /g, '-');
      if (classroomCode in participation) {
        participationByClassroomId[c.uid] = participation[classroomCode];
      }
    });

    yield put(
      actions.queryParticipationByTeamSuccess(
        action.cycle.uid,
        participationByClassroomId,
      ),
    );
  } catch (error) {
    yield put(actions.queryParticipationByTeamFailure(error));
  }
}

export function* completionByTeamRequest(action) {
  try {
    const { failure: pptFailure } = yield putAndTakePayload(
      participantActions.queryParticipantsByTeam(action.teamId),
    );
    if (pptFailure) {
      throw new Error(pptFailure);
    }

    // This HOA assumes it is called after the program context is loaded, so
    // cycle and team classrooms are already available.
    const cycle = yield select(selectors.cycle, {
      parentLabel: action.cycleId,
    });
    const classrooms = yield select(selectors.team.classrooms.list, {
      teamId: action.teamId,
    });

    const completionResults = yield all(
      classrooms.map(c =>
        putAndTakePayload(
          actions.queryCompletionByClassroom(cycle, c),
          actions.queryCompletionByClassroomSuccess().type,
          actions.queryCompletionByClassroomFailure().type,
        ),
      ),
    );

    completionResults.forEach(result => {
      if (result.failure) {
        throw new Error(result.failure);
      }
    });

    yield put(actions.queryCompletionByTeamSuccess(action.cycleId));
  } catch (error) {
    console.error(error);
    yield put(actions.queryCompletionByTeamFailure(error));
  }
}

export function* completionByUserRequest(action) {
  try {
    // This HOA assumes it is called after the program context is loaded, so
    // cycle and team classrooms are already available.
    const cycle = yield select(selectors.cycle, {
      parentLabel: action.cycleId,
    });
    const classrooms = yield select(selectors.auth.user.team.classrooms.list, {
      teamId: cycle.team_id,
    });

    const pptResults = yield all(
      classrooms.map(c =>
        putAndTakePayload(
          participantActions.queryParticipantsByClassroom(c.uid),
        ),
      ),
    );
    const completionResults = yield all(
      classrooms.map(c =>
        putAndTakePayload(
          actions.queryCompletionByClassroom(cycle, c),
          actions.queryCompletionByClassroomSuccess().type,
          actions.queryCompletionByClassroomFailure().type,
        ),
      ),
    );

    pptResults.concat(completionResults).forEach(result => {
      if (result.failure) {
        throw new Error(result.failure);
      }
    });

    if (classrooms.length === 0) {
      // This saga might not otherwise have any async operations, so the whole
      // thing is synchronous, which can actually block mapStateToProps from
      // running when it should. This essentially forces an event loop break so
      // other waiting async code can run.
      /* eslint-disable-next-line require-await */
      yield call(async () => null);
    }

    yield put(actions.queryCompletionByUserSuccess(action.cycleId));
  } catch (error) {
    console.error(error);
    yield put(actions.queryCompletionByUserFailure(error));
  }
}

export function* completionByClassroomRequest(action) {
  try {
    const notScheduled =
      !action.cycle || !action.cycle.start_date || !action.cycle.end_date;

    if (notScheduled) {
      yield put(actions.queryCompletionByClassroomSuccess(undefined, {}));
      return;
    }

    const completion = yield callWithApiAuthentication(
      completionApi.queryByClassroom,
      action.classroom,
      action.cycle.start_date,
      action.cycle.extended_end_date || action.cycle.end_date,
    );

    yield put(
      actions.queryCompletionByClassroomSuccess(action.cycle.uid, {
        [action.classroom.uid]: completion,
      }),
    );
  } catch (error) {
    console.error(error);
    yield put(actions.queryCompletionByClassroomFailure(error));
  }
}

export default function* cyclesSaga() {
  yield all([
    takeEvery(types.CYCLES_BY_TEAM_REQUEST, cyclesByTeamRequest),
    takeEvery(
      types.CYCLES_QUERY_CURRENT_BY_TEAM_REQUEST,
      cyclesCurrentByTeamRequest,
    ),
    takeEvery(types.CYCLES_GET_REQUEST, getCycle),
    takeEvery(types.CYCLE_ADD_REQUEST, addCycle),
    takeEvery(types.CYCLE_UPDATE_REQUEST, updateCycle),
    takeEvery(types.CYCLE_REMOVE_REQUEST, removeCycle),
    takeEvery(
      types.CYCLE_QUERY_PARTICIPATION_BY_TEAM_REQUEST,
      participationByTeamRequest,
    ),
    takeEvery(actions.queryCompletionByTeam().type, completionByTeamRequest),
    takeEvery(actions.queryCompletionByUser().type, completionByUserRequest),
    takeEvery(
      actions.queryCompletionByClassroom().type,
      completionByClassroomRequest,
    ),
  ]);
}
