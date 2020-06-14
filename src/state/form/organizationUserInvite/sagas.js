import { put, race, select, take } from 'redux-saga/effects';

import * as routes from 'routes';
import selectors from 'state/selectors';
import formAction from 'state/form/organizationUserInvite/actions';
import formSubmissionError from 'utils/formSubmissionError';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as uiActions from 'state/ui/actions';

export default function* organizationUserInviteForm({ payload }) {
  const { formValues: userFromForm, organization } = payload;

  try {
    const authUser = yield select(selectors.authUser);

    yield put(
      usersActions.inviteOrganizationUser(userFromForm, authUser, organization),
    );

    const { failure } = yield race({
      success: take(usersTypes.INVITE_ORGANIZATION_USER_SUCCESS),
      failure: take(usersTypes.INVITE_ORGANIZATION_USER_FAILURE),
    });

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());
    yield put(
      uiActions.redirectTo(routes.toOrganizationUsers(organization.uid)),
    );
  } catch (error) {
    const formError = formSubmissionError('Unable to send invite.');
    yield put(formAction.failure(formError));
  }
}
