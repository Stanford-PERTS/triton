import { all, put, takeLatest } from 'redux-saga/effects';

import reduxFormSaga from 'redux-form-saga';
import formSaga from './form/sagas';

import authSaga from './auth/sagas';
import classroomsSaga from './classrooms/sagas';
import cyclesSaga from './cycles/sagas';
import digestsSaga from './digests/sagas';
import emailTemplatesSaga from './emailTemplates/sagas';
import metricsSaga from './metrics/sagas';
import organizationsSaga from './organizations/sagas';
import participantsSaga from './participants/sagas';
import programsSaga from './programs/sagas';
import reportsSaga from './reports/sagas';
import responsesSaga from './responses/sagas';
import sharedSaga from './shared/sagas';
import surveysSaga from './surveys/sagas';
import teamsSaga from './teams/sagas';
import uiSaga from './ui/sagas';
import usersSaga from './users/sagas';

import organizationFormSaga from './form/organization/sagas';

function* redirectRequest() {
  yield put({ type: 'REDIRECT_RESET' });
}

export default function* rootSaga() {
  yield all([
    // Base sagas
    authSaga(),
    classroomsSaga(),
    cyclesSaga(),
    emailTemplatesSaga(),
    digestsSaga(),
    metricsSaga(),
    organizationsSaga(),
    participantsSaga(),
    programsSaga(),
    reportsSaga(),
    responsesSaga(),
    sharedSaga(),
    surveysSaga(),
    teamsSaga(),
    uiSaga(),
    usersSaga(),

    // Form sagas
    organizationFormSaga(),

    // Additional sagas
    takeLatest('REDIRECT_REQUEST', redirectRequest()),

    // https://github.com/mhssmnn/redux-form-saga
    reduxFormSaga(),
    formSaga(),
  ]);
}
