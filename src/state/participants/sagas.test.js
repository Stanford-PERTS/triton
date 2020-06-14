import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import { expectSaga } from 'redux-saga-test-plan';
import {
  addParticipants,
  addParticipantsAndRecount,
  removeParticipants,
  removeParticipantsAndRecount,
} from './actions';
import {
  getClassroom,
  getClassroomSuccess,
  getClassroomFailure,
} from 'state/classrooms/actions';
import { addAndRecount, removeAndRecount } from './sagas';

describe('participant sagas', () => {
  describe('runs addAndRecount', () => {
    const classroomId = 'Classroom_001';
    const classroom = { uid: classroomId };
    const participants = [
      // Note 'classroom_id', not plural, since this is not a PUT, rather the
      // API only allows adding to one classroom at a time.
      { uid: 'Participant_001', classroom_id: classroomId },
      { uid: 'Participant_002', classroom_id: classroomId },
    ];
    const redirect = '/redirect';

    const action = addParticipantsAndRecount(participants, redirect);
    const error = 'generic error message';

    it('succeeds', () =>
      expectSaga(addAndRecount, action)
        .put(addParticipants(participants))
        .dispatch({ type: types.PARTICIPANTS_ADD_SUCCESS, participants })
        // only ever one classroom b/c adding participants cannot affect
        // the count of participants in _other_ classrooms
        .put(getClassroom(classroomId))
        .dispatch(getClassroomSuccess(classroom))
        .put(uiActions.redirectTo(action.redirect))
        .put({ type: types.HOA_PARTICIPANTS_ADD_SUCCESS })
        .run());

    it('fails if adding a participant fails', () =>
      expectSaga(addAndRecount, action)
        .put(addParticipants(participants))
        .dispatch({ type: types.PARTICIPANTS_ADD_FAILURE, error })
        .not.put(getClassroom(classroomId))
        .put({
          type: types.HOA_PARTICIPANTS_ADD_FAILURE,
          error: `Error: ${error}`,
        })
        .run());

    it('fails if getting a classroom fails', () =>
      expectSaga(addAndRecount, action)
        .put(addParticipants(participants))
        .dispatch({ type: types.PARTICIPANTS_ADD_SUCCESS, participants })
        .put(getClassroom(classroomId))
        .dispatch(getClassroomFailure(error, classroomId, '/redirect'))
        .put({
          type: types.HOA_PARTICIPANTS_ADD_FAILURE,
          error: `Error: ${error}`,
        })
        .run());
  });

  describe('runs removeAndRecount', () => {
    const classroomId = 'Classroom_001';
    const asscClassroomId = 'Classroom_002';
    const classroom = { uid: classroomId };
    const asscClassroom = { uid: asscClassroomId };
    const participants = [
      // Note 'classroom_ids', plural, since this is a PUT so we'll match the
      // db schema exactly.
      { uid: 'Participant_001', classroom_ids: [classroomId, asscClassroomId] },
      { uid: 'Participant_002', classroom_ids: [classroomId] },
    ];

    const action = removeParticipantsAndRecount(participants, classroomId);
    const error = 'generic error message';

    it('succeeds', () =>
      expectSaga(removeAndRecount, action)
        .put(removeParticipants(participants, classroomId))
        .dispatch({ type: types.PARTICIPANTS_REMOVE_SUCCESS })
        // Should recount num_students for all affected classrooms
        .put(getClassroom(classroomId))
        .put(getClassroom(asscClassroomId))
        .dispatch(getClassroomSuccess(classroom))
        .dispatch(getClassroomSuccess(asscClassroom))
        .put({ type: types.HOA_PARTICIPANTS_REMOVE_SUCCESS })
        .run());

    it('fails if removing a participant fails', () =>
      expectSaga(removeAndRecount, action)
        .put(removeParticipants(participants, classroomId))
        .dispatch({ type: types.PARTICIPANTS_REMOVE_FAILURE, error })
        .put({
          type: types.HOA_PARTICIPANTS_REMOVE_FAILURE,
          error: `Error: ${error}`,
        })
        .run());

    it('fails if getting a classroom fails', () =>
      expectSaga(removeAndRecount, action)
        .put(removeParticipants(participants, classroomId))
        .dispatch({ type: types.PARTICIPANTS_REMOVE_SUCCESS })
        // Should recount num_students for all affected classrooms
        .put(getClassroom(classroomId))
        .put(getClassroom(asscClassroomId))
        // Any one failure should fail the HOA.
        .dispatch(getClassroomFailure(error, classroomId, '/redirect'))
        .dispatch(getClassroomSuccess(asscClassroom))
        .put({
          type: types.HOA_PARTICIPANTS_REMOVE_FAILURE,
          error: `Error: ${error}`,
        })
        .run());
  });
});
