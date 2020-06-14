import { put, race, select, take } from 'redux-saga/effects';

import * as routes from 'routes';
import selectors from 'state/selectors';
import formAction from 'state/form/teamUserInvite/actions';
import formSubmissionError from 'utils/formSubmissionError';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as uiActions from 'state/ui/actions';

export default function* teamUserInviteForm({ payload }) {
  const { formValues: userFromForm, team, stepType, parentLabel } = payload;

  try {
    const authUser = yield select(selectors.authUser);

    yield put(usersActions.inviteUsers([userFromForm], authUser, team));

    const { failure } = yield race({
      success: take(usersTypes.INVITE_USERS_SUCCESS),
      failure: take(usersTypes.INVITE_USERS_FAILURE),
    });

    if (failure) {
      throw new Error();
    }

    yield put(formAction.success());

    const redirect =
      stepType && parentLabel
        ? routes.toProgramTeamUsers(team.uid, stepType, parentLabel)
        : routes.toTeamUsers(team.uid);
    yield put(uiActions.redirectTo(redirect));
  } catch (error) {
    const formError = formSubmissionError('Unable to send invite.');
    yield put(formAction.failure(formError));
  }
}
