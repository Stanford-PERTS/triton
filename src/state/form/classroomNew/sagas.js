import { put, race, take } from 'redux-saga/effects';

import formAction from 'state/form/classroomNew/actions';
import formSubmissionError from 'utils/formSubmissionError';
import * as classroomsActions from 'state/classrooms/actions';

export default function* classroomNewForm({ payload }) {
  const { formValues, program, team, toBack } = payload;

  const newClassroom = {
    team_id: team.uid,
    program_label: program.label,
    ...formValues,
  };
  try {
    yield put(classroomsActions.addClassroom(newClassroom, toBack));

    const { failure } = yield race({
      success: take(classroomsActions.addClassroomSuccess().type),
      failure: take(classroomsActions.addClassroomFailure().type),
    });

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());
  } catch (error) {
    console.error(error);
    const formError = formSubmissionError('Unable to save changes.');
    yield put(formAction.failure(formError));
  }
}
