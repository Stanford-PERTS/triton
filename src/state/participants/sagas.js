/* eslint no-console: off */
import { all, call, takeEvery, put } from 'redux-saga/effects';
import { reset } from 'redux-form';

import * as actions from './actions';
import * as classroomsActions from 'state/classrooms/actions';
import * as participantsApi from 'services/triton/participants';
import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import { callWithApiAuthentication } from '../api';
import { CLEAR_FLAGS } from 'state/actionTypes';
import putAndTakePayload from 'utils/putAndTakePayload';

export function* participantsByClassroomRequest(action) {
  try {
    const participants = yield callWithApiAuthentication(
      participantsApi.queryByClassroom,
      action.classroomId,
    );

    yield put(actions.queryParticipantsByClassroomSuccess(participants));
  } catch (error) {
    yield put(actions.queryParticipantsByClassroomFailure(error));
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* participantsByTeamRequest(action) {
  try {
    const participants = yield callWithApiAuthentication(
      participantsApi.queryByTeam,
      action.teamId,
    );

    yield put(actions.queryParticipantsByTeamSuccess(participants));
  } catch (error) {
    yield put(actions.queryParticipantsByTeamFailure(error));
  }
}

export function* addParticipants(action) {
  try {
    const participants = yield callWithApiAuthentication(
      participantsApi.postBatch,
      action.participants,
    );

    // Note that we use the response from the API to send to the reducer,
    // not the form params we started with.
    yield put({
      type: types.PARTICIPANTS_ADD_SUCCESS,
      participants,
      payload: participants,
    });
    yield put(reset('classroomRosterAdd', 'student_ids', ''));
  } catch (error) {
    yield put({ type: types.PARTICIPANTS_ADD_FAILURE, error: String(error) });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* addAndRecount(action) {
  try {
    // N.B. These are not real participant objects from the API; they're
    // form values. Thus there is a single classrom id available, not the
    // normal array `classroom_ids`.
    const classroomIds = [
      ...new Set(action.participants.map(p => p.classroom_id)),
    ];
    // Do the atomic add.
    const { failure: addFailure } = yield putAndTakePayload(
      actions.addParticipants(action.participants),
    );
    if (addFailure) {
      throw new Error(addFailure.error);
    }

    const allClassResult = yield all(
      classroomIds.map(cId =>
        putAndTakePayload(classroomsActions.getClassroom(cId)),
      ),
    );
    const failures = allClassResult.map(r => r.failure).filter(r => r);
    if (failures.length) {
      throw new Error(failures.map(f => f.error).join(', '));
    }

    yield put(uiActions.redirectTo(action.redirect));
    yield put({
      type: types.HOA_PARTICIPANTS_ADD_SUCCESS,
    });
  } catch (error) {
    yield put({
      type: types.HOA_PARTICIPANTS_ADD_FAILURE,
      error: String(error),
    });
  }
}

export function* updateParticipant(action) {
  try {
    const participant = yield callWithApiAuthentication(
      participantsApi.update,
      action.participant,
    );

    yield put({
      type: types.PARTICIPANTS_UPDATE_SUCCESS,
      participant,
    });
  } catch (error) {
    yield put({
      type: types.PARTICIPANTS_UPDATE_FAILURE,
      error: String(error),
    });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* removeParticipants(action) {
  try {
    yield all(
      action.participants.map(p =>
        call(
          callWithApiAuthentication,
          participantsApi.remove,
          p,
          action.classroomId,
        ),
      ),
    );

    yield put({
      type: types.PARTICIPANTS_REMOVE_SUCCESS,
      participantIds: action.participants.map(p => p.uid),
    });
  } catch (error) {
    yield put({
      type: types.PARTICIPANTS_REMOVE_FAILURE,
      error: String(error),
    });
    yield put({ type: CLEAR_FLAGS });
  }
}

export function* removeAndRecount(action) {
  try {
    const affectedClassroomIds = action.participants.reduce((acc, p) => {
      p.classroom_ids.forEach(id => {
        if (!acc.includes(id)) {
          acc.push(id);
        }
      });

      return acc;
    }, []);

    // Do the atomic remove.
    const { failure: removeFailure } = yield putAndTakePayload(
      actions.removeParticipants(action.participants, action.classroomId),
    );
    if (removeFailure) {
      throw new Error(removeFailure.error);
    }

    const allClassResult = yield all(
      affectedClassroomIds.map(cId =>
        putAndTakePayload(classroomsActions.getClassroom(cId)),
      ),
    );
    const failures = allClassResult.map(r => r.failure).filter(r => r);
    if (failures.length) {
      throw new Error(failures.map(f => f.error).join(', '));
    }

    yield put({ type: types.HOA_PARTICIPANTS_REMOVE_SUCCESS });
  } catch (error) {
    yield put({
      type: types.HOA_PARTICIPANTS_REMOVE_FAILURE,
      error: String(error),
    });
  }
}

export default function* participantsSaga() {
  yield all([
    takeEvery(
      actions.queryParticipantsByClassroom().type,
      participantsByClassroomRequest,
    ),
    takeEvery(
      actions.queryParticipantsByTeam().type,
      participantsByTeamRequest,
    ),
    takeEvery(types.PARTICIPANTS_ADD_REQUEST, addParticipants),
    takeEvery(types.HOA_PARTICIPANTS_ADD_REQUEST, addAndRecount),
    takeEvery(types.PARTICIPANTS_UPDATE_REQUEST, updateParticipant),
    takeEvery(types.PARTICIPANTS_REMOVE_REQUEST, removeParticipants),
    takeEvery(types.HOA_PARTICIPANTS_REMOVE_REQUEST, removeAndRecount),
  ]);
}
