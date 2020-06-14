import { put, race, select, take } from 'redux-saga/effects';
import omit from 'lodash/omit';

import * as responsesActions from 'state/responses/actions';
import * as responsesTypes from 'state/responses/actionTypes';
import * as routes from 'routes';
import * as uiActions from 'state/ui/actions';
import formAction from 'state/form/TaskModule/actions';
import formSubmissionError from 'utils/formSubmissionError';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import { formValuesToBody } from 'state/responses/helpers';
import { RESPONSE_TYPE_USER } from 'state/form/TaskModule/actionTypes';

/* eslint complexity: "off" */
export default function* taskModuleForm({ payload }) {
  const { form, formValues, task, team, response } = payload;
  const { stepType, parentLabel, page, totalPages } = fromParams(payload);

  // Pull moduleLabel from task, not params, since we render response forms both
  // as <Task type="module"> and <Task type="inlineModule"> where the
  // moduleLabel is not in the route.
  const { label: moduleLabel } = task;

  // The `task.responseType` at which the response is to be recorded should map
  // exactly onto a response type. This is checked in the TaskModule scene.

  // _routeAfterSuccess is a flag to signal which way to route the user after
  // a successful form submission. We don't want to save it to the response.
  const bodyFromForm = omit(formValues, '_routeAfterSuccess');
  const responseBody = formValuesToBody(
    bodyFromForm,
    response && response.body,
  );
  const routeAfterSuccess = formValues._routeAfterSuccess;

  // If a TaskModule has no Pages, or there is only a single Page, then
  // submitting a response will set the user's progress to 100.
  let newProgress = 100;
  // Otherwise, we'll set the user's progress to a percentage of pages completed
  // out of total pages in the module.
  //
  // NOTE: If we are using the Pages component to allow for paging, then we
  // assume that there is a final Page that confirms completion. Because of this
  // we need to calculate progress based on 1 less page (`totalPages - 1`).
  if (page && totalPages && page !== totalPages) {
    newProgress = Math.ceil((page / (totalPages - 1)) * 100);
  }

  // We will only change the progress & page recorded if it advances progress.
  const progressToRecord =
    !response || newProgress > response.progress
      ? newProgress
      : response.progress;

  const pageToRecord = !response || page > response.page ? page : response.page;

  try {
    let failure;

    if (response) {
      // If the form is in an error state because of a conflict, but we're
      // still submitting, assume the user intends to force the update.
      const errorCode = yield select(selectors.form.errorCode, { form });
      const force = errorCode === 409;
      yield put(
        responsesActions.updateResponse(
          // note: inconsistant function arguments pattern
          response.uid,
          {
            ...response,
            body: responseBody,
            progress: progressToRecord,
            page: pageToRecord,
          },
          force,
        ),
      );

      ({ failure } = yield race({
        success: take(responsesTypes.RESPONSES_UPDATE_SUCCESS),
        failure: take(responsesTypes.RESPONSES_UPDATE_FAILURE),
      }));
    } else {
      const userId = yield select(selectors.auth.user.uid);

      yield put(
        responsesActions.addResponse({
          body: responseBody,
          type: task.responseType,
          // Only include the user uid if it's a user type response
          user_id: task.responseType === RESPONSE_TYPE_USER ? userId : '',
          team_id: team.uid,
          parent_id: parentLabel,
          module_label: moduleLabel,
          progress: progressToRecord,
          page: pageToRecord,
        }),
      );

      ({ failure } = yield race({
        success: take(responsesTypes.RESPONSES_ADD_SUCCESS),
        failure: take(responsesTypes.RESPONSES_ADD_FAILURE),
      }));
    }

    if (failure) {
      throw failure.error;
    }

    yield put(formAction.success());

    // After the response has saved, redirect the user to the next page.
    if (
      routeAfterSuccess === 'next' &&
      page &&
      totalPages &&
      page < totalPages
    ) {
      yield put(
        uiActions.redirectTo(
          routes.toProgramModulePage(
            team.uid,
            stepType,
            parentLabel,
            moduleLabel,
            page + 1,
            totalPages,
          ),
          true,
        ),
      );
    }

    // After the response has saved, redirect the user to the previous page.
    if (routeAfterSuccess === 'prev' && page && totalPages && page > 1) {
      yield put(
        uiActions.redirectTo(
          routes.toProgramModulePage(
            team.uid,
            stepType,
            parentLabel,
            moduleLabel,
            page - 1,
            totalPages,
          ),
          true,
        ),
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in taskModuleForm saga:', error);
    const formError = formSubmissionError(
      'Unable to save. Refresh to see new responses.',
      error.code,
    );
    yield put(formAction.failure(formError));
  }
}
