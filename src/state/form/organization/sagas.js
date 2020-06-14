import { all, call, takeLatest, put } from 'redux-saga/effects';

import { clearFlags } from 'state/actions';
import * as uiActions from 'state/ui/actions';
import * as types from './actionTypes';
import {
  organizationAddRequest,
  organizationUpdateRequest,
} from 'state/organizations/sagas';

import * as routes from 'routes';

export function* submitOrganizationFormRequest(action) {
  try {
    yield call(organizationUpdateRequest, {
      organization: action.organization,
    });

    yield put({
      type: types.SUBMIT_ORGANIZATION_FORM_SUCCESS,
      organization: action.organization,
    });
  } catch (error) {
    yield put({ type: types.SUBMIT_ORGANIZATION_FORM_FAILURE, error });
    yield put(uiActions.redirectTo(routes.toHomeNoProgram()));
    yield put(clearFlags());
  }
}

export function* submitNewOrganizationFormRequest(action) {
  try {
    const organization = yield call(organizationAddRequest, {
      organization: action.organization,
    });

    yield put({
      type: types.SUBMIT_NEW_ORGANIZATION_FORM_SUCCESS,
      organization: action.organization,
    });
    yield put(
      uiActions.redirectTo(routes.toOrganizationDetails(organization.uid)),
    );

    yield put(clearFlags());
  } catch (error) {
    yield put({
      type: types.SUBMIT_NEW_ORGANIZATION_FORM_FAILURE,
      error,
    });
    yield put(uiActions.redirectTo(routes.toHomeNoProgram()));

    yield put(clearFlags());
  }
}

export default function* organizationFormSaga() {
  yield all([
    takeLatest(
      types.SUBMIT_ORGANIZATION_FORM_REQUEST,
      submitOrganizationFormRequest,
    ),
    takeLatest(
      types.SUBMIT_NEW_ORGANIZATION_FORM_REQUEST,
      submitNewOrganizationFormRequest,
    ),
  ]);
}
