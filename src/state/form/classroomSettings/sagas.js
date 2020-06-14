import { put, race, take } from 'redux-saga/effects';

import formAction from 'state/form/classroomSettings/actions';
import formSubmissionError from 'utils/formSubmissionError';
import * as classroomsActions from 'state/classrooms/actions';

export default function* classroomSettingsForm({ payload }) {
  const { formValues: classroomFromForm } = payload;

  try {
    yield put(classroomsActions.updateClassroom(classroomFromForm));

    const { failure } = yield race({
      success: take(classroomsActions.updateClassroomSuccess().type),
      failure: take(classroomsActions.updateClassroomFailure().type),
    });

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());
  } catch (error) {
    console.error('classroomSettings error...', error);
    const formError = formSubmissionError('Unable to save changes.');
    yield put(formAction.failure(formError));
  }
}
