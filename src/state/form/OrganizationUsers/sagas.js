import { put, select } from 'redux-saga/effects';
import putAndTakePayload from 'utils/putAndTakePayload';

import formAction from 'state/form/OrganizationUsers/actions';
import formSubmissionError from 'utils/formSubmissionError';

import * as routes from 'routes';
import selectors from 'state/selectors';
import * as uiActions from 'state/ui/actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as sharedActions from 'state/shared/actions';
import * as sharedTypes from 'state/shared/actionTypes';

export default function* organizationUsersForm({ payload }) {
  const {
    formValues: { isInviting, isRemoving },
  } = payload;

  if (isInviting) {
    yield organizationUsersFormInvite({ payload });
    return;
  }

  if (isRemoving) {
    yield organizationUsersFormRemove({ payload });
  }
}

export function* organizationUsersFormInvite({ payload }) {
  const {
    formValues: { user, organization },
  } = payload;

  try {
    const authUser = yield select(selectors.auth.user);

    const { failure } = yield putAndTakePayload(
      usersActions.inviteOrganizationUser(user, authUser, organization),
      usersTypes.INVITE_ORGANIZATION_USER_SUCCESS,
      usersTypes.INVITE_ORGANIZATION_USER_FAILURE,
    );

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());
  } catch (error) {
    const formError = formSubmissionError('Unable to send invite.');
    yield put(formAction.failure(formError));
  }
}

export function* organizationUsersFormRemove({ payload }) {
  const {
    formValues: { user, organization },
  } = payload;

  try {
    const authUser = yield select(selectors.auth.user);

    const { failure } = yield putAndTakePayload(
      sharedActions.removeOrganizationUser(organization, user),
      sharedTypes.REMOVE_ORGANIZATION_USER_SUCCESS,
      sharedTypes.REMOVE_ORGANIZATION_USER_FAILURE,
    );

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());

    if (authUser.uid === user.uid) {
      yield put(uiActions.redirectTo(routes.toRoot()));
    }
  } catch (error) {
    const formError = formSubmissionError('Unable to remove user.');
    yield put(formAction.failure(formError));
  }
}
