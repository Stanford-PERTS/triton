import { put, race, take } from 'redux-saga/effects';

import formAction from 'state/form/userDetails/actions';
import formSubmissionError from 'utils/formSubmissionError';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';

export default function* userDetailsForm({ payload }) {
  const { formValues: userFromForm } = payload;

  try {
    yield put(usersActions.updateUser(userFromForm));

    const { failure } = yield race({
      success: take(usersTypes.UPDATE_USER_SUCCESS),
      failure: take(usersTypes.UPDATE_USER_FAILURE),
    });

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());
  } catch (error) {
    const formError = formSubmissionError('Unable to save changes.');
    yield put(formAction.failure(formError));
  }
}
