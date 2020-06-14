import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { entitiesReducer, defaultInitialState } from 'state/helpers';
import composeReducers from 'utils/composeReducers';

import auth from './auth/reducer';
import shared from './shared/reducer';
import ui from './ui/reducer';
import uploads from './uploads/reducer';

import classrooms from './classrooms/reducer';
import cycles from './cycles/reducer';
import dashboard from './dashboard/reducer';
import digests from './digests/reducer';
import metrics from './metrics/reducer';
import organizations from './organizations/reducer';
import participants from './participants/reducer';
import reports from './reports/reducer';
import responses from './responses/reducer';
import surveys from './surveys/reducer';
import teams from './teams/reducer';
import users from './users/reducer';
import { slice as emailTemplatesSlice } from './emailTemplates';

import loginForm from './form/login/reducer';
import setPasswordForm from './form/setPassword/reducer';
import signUpForm from './form/signUp/reducer';
import {
  organizationReduxForm,
  organizationForm,
} from './form/organization/reducer';
import {
  attachOrganizationReduxForm,
  attachOrganizationForm,
} from './form/attachOrganization/reducer';
import surveyForm from './form/survey/reducer';
import classroomForm from './form/classroom/reducer';
import userForm from './form/user/reducer';
import userInviteForm from './form/userInvite/reducer';

const reducers = {
  auth,

  entities: combineReducers({
    classrooms: composeReducers(classrooms, entitiesReducer('classrooms')),
    cycles: composeReducers(cycles, entitiesReducer('cycles')),
    digests: composeReducers(digests, entitiesReducer('digests')),
    metrics: composeReducers(metrics, entitiesReducer('metrics')),
    organizations: composeReducers(
      organizations,
      entitiesReducer('organizations'),
    ),
    participants: composeReducers(
      participants,
      entitiesReducer('participants'),
    ),
    programs: entitiesReducer('programs', defaultInitialState),
    reports: composeReducers(reports, entitiesReducer('reports')),
    responses: composeReducers(responses, entitiesReducer('responses')),
    surveys: composeReducers(surveys, entitiesReducer('surveys')),
    teams: composeReducers(teams, entitiesReducer('teams')),
    users: composeReducers(users, entitiesReducer('users')),
    // Third-party data. Assume our services will transform incoming data to
    // meet expectations, e.g. having a uid.
    emailTemplates: entitiesReducer(emailTemplatesSlice, defaultInitialState),
  }),

  // Existing entity reducers
  sharedData: shared,
  uploadsData: uploads,

  // Form reducers
  organizationFormData: organizationForm,
  attachOrganizationFormData: attachOrganizationForm,

  // redux-form reducers
  form: formReducer.plugin({
    classroom: classroomForm,
    login: loginForm,
    organization: organizationReduxForm,
    setPassword: setPasswordForm,
    signUp: signUpForm,
    survey: surveyForm,
    attachOrganization: attachOrganizationReduxForm,
    user: userForm,
    userInvite: userInviteForm,
  }),

  dashboard,
  ui,
};

if (window.Cypress) {
  /* eslint no-console: off */
  console.log(
    'Enabling Redux debugging output. See state/reducers to turn off.',
  );
  reducers.debugRedux = (state = {}, action) => {
    console.log('>>', action.type, action);
    if (action.payload instanceof Error) {
      console.log(action.payload.toString());
      console.error(action.payload);
    }
    return state;
  };
}

const rootReducer = combineReducers(reducers);
export default rootReducer;
