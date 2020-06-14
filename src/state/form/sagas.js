import { all, takeEvery } from 'redux-saga/effects';

import taskModuleAction from 'state/form/TaskModule/actions';
import taskModuleSaga from 'state/form/TaskModule/sagas';

import organizationUserInviteAction from 'state/form/organizationUserInvite/actions';
import organizationUserInviteSaga from 'state/form/organizationUserInvite/sagas';

import organizationUsersAction from './OrganizationUsers/actions';
import organizationUsersSaga from './OrganizationUsers/sagas';

import teamUserInviteAction from 'state/form/teamUserInvite/actions';
import teamUserInviteSaga from 'state/form/teamUserInvite/sagas';

import classroomNewFormAction from 'state/form/classroomNew/actions';
import classroomNewFormSaga from 'state/form/classroomNew/sagas';

import classroomSettingsFormAction from 'state/form/classroomSettings/actions';
import classroomSettingsFormSaga from 'state/form/classroomSettings/sagas';

import userDetailsFormAction from 'state/form/userDetails/actions';
import userDetailsFormSaga from 'state/form/userDetails/sagas';

import emailSelectedFormAction from 'state/form/emailSelected/actions';
import emailSelectedFormSaga from 'state/form/emailSelected/sagas';

export default function* formSaga() {
  yield all([
    takeEvery(taskModuleAction.REQUEST, taskModuleSaga),
    takeEvery(organizationUserInviteAction.REQUEST, organizationUserInviteSaga),
    takeEvery(organizationUsersAction.REQUEST, organizationUsersSaga),
    takeEvery(teamUserInviteAction.REQUEST, teamUserInviteSaga),
    takeEvery(classroomNewFormAction.REQUEST, classroomNewFormSaga),
    takeEvery(classroomSettingsFormAction.REQUEST, classroomSettingsFormSaga),
    takeEvery(userDetailsFormAction.REQUEST, userDetailsFormSaga),
    takeEvery(emailSelectedFormAction.REQUEST, emailSelectedFormSaga),
  ]);
}
