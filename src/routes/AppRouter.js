import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import ApplicationWrapper from 'components/ApplicationWrapper';
import AuthenticatedRoute from 'components/AuthenticatedRoute';
import UnauthenticatedRoute from 'components/UnauthenticatedRoute';
import { RenderWithTermsContext } from 'components/TermsContext';

import InactivityModal from 'scenes/InactivityModal';
import Login from 'scenes/Login';
// import OfflineNotification from 'scenes/Login/OfflineNotification';
import LoginSecret from 'scenes/LoginSecret';
import ResetPassword from 'scenes/ResetPassword';
import SetPassword from 'scenes/SetPassword';
import Logout from 'scenes/Logout';
import ReportsUpload from 'scenes/ReportsUpload';
import Survey from 'scenes/Survey';
import SurveyInstructions from 'scenes/SurveyInstructions';
import Home from 'scenes/Home';
import Organization from 'scenes/Organization';
import OrganizationDetails from 'scenes/OrganizationDetails';
import OrganizationNew from 'scenes/OrganizationNew';
import OrganizationInstructions from 'scenes/OrganizationInstructions';
import OrganizationUserInvite from 'scenes/OrganizationUserInvite';
import ProgramSearch from 'scenes/ProgramSearch';
import TeamOrganizations from 'scenes/TeamOrganizations';
import AttachOrganization from 'scenes/AttachOrganization';
import Team from 'scenes/Team';
import TeamNew from 'scenes/TeamNew';
import ReportsSettings from 'scenes/ReportsSettings';
import TeamDetails from 'scenes/TeamDetails';
import TeamUsers from 'scenes/TeamUsers';
import TeamUserInvite from 'scenes/TeamUserInvite';
import ClassroomDetails from 'scenes/ClassroomDetails';
import ClassroomSettings from 'scenes/ClassroomSettings';
import ClassroomNew from 'scenes/ClassroomNew';
import RosterAdd from 'scenes/RosterAdd';
import Documents from 'scenes/Documents';
import UserDetails from 'scenes/UserDetails';
import Notifications from 'scenes/Notifications';

import * as routes from 'routes';

const APTeams = () => <span>Hello Teams</span>;
const APOrgs = () => <span>Hello Teams</span>;

export const AppRouterTest = props => (
  <div>
    <Route path="/teams" component={APTeams} />
    <Route path="/organizations" component={APOrgs} />
  </div>
);

// Exportable so that we can wrap this router inside a MemoryRouter in tests.
// See src/scenes/TaskModule/index.test.js
export const AppRouterRouting = ({ userId, userIsAdmin, userIsLoggedIn }) => (
  <div>
    {userIsLoggedIn && <InactivityModal />}
    <ApplicationWrapper userId={userId} userIsLoggedIn={userIsLoggedIn}>
      <Switch>
        <UnauthenticatedRoute
          authenticated={userIsLoggedIn}
          path={routes.toLogin()}
          component={Login}
        />

        <UnauthenticatedRoute
          authenticated={userIsLoggedIn}
          path={routes.toSecretLogin()}
          component={LoginSecret}
        />
        <UnauthenticatedRoute
          authenticated={userIsLoggedIn}
          path={routes.toSetPassword()}
          component={SetPassword}
        />
        <UnauthenticatedRoute
          authenticated={userIsLoggedIn}
          path={routes.toResetPassword()}
          component={ResetPassword}
        />

        <Route path={routes.toLogout()} component={Logout} />

        <AuthenticatedRoute
          exact
          strict={false}
          path={routes.toNotifications()}
          authenticated={userIsLoggedIn}
          component={Notifications}
        />

        <AuthenticatedRoute
          exact
          strict={false}
          path={routes.toReportsUpload()}
          authenticated={userIsAdmin}
          component={ReportsUpload}
        />

        <AuthenticatedRoute
          exact
          strict={false}
          path={routes.toProgramSearch()}
          authenticated={userIsAdmin}
          component={ProgramSearch}
        />

        <AuthenticatedRoute
          exact
          strict={false}
          path={routes.toHome()}
          authenticated={userIsLoggedIn}
          component={Home}
        />

        <AuthenticatedRoute
          exact
          strict={false}
          path={routes.toHomeNoProgram()}
          authenticated={userIsLoggedIn}
          component={Home}
        />

        <AuthenticatedRoute
          exact
          path={routes.toNewTeam()}
          authenticated={userIsLoggedIn}
          component={TeamNew}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamDetails()}
          authenticated={userIsLoggedIn}
          component={TeamDetails}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamUsers()}
          authenticated={userIsLoggedIn}
          component={TeamUsers}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamDocuments()}
          authenticated={userIsLoggedIn}
          component={Documents}
        />

        <AuthenticatedRoute
          exact
          path={routes.toProgramSurveyInstructions()}
          authenticated={userIsLoggedIn}
          component={SurveyInstructions}
        />

        <AuthenticatedRoute
          path={routes.toProgramModule()}
          authenticated={userIsLoggedIn}
          component={Team}
        />

        <AuthenticatedRoute
          path={routes.toProgramSteps()}
          authenticated={userIsLoggedIn}
          component={Team}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeam()}
          authenticated={userIsLoggedIn}
          component={Team}
        />

        <AuthenticatedRoute
          exact
          path={routes.toNewClassroom()}
          authenticated={userIsLoggedIn}
          component={ClassroomNew}
        />

        <AuthenticatedRoute
          path={routes.toTeamSchedule()}
          authenticated={userIsLoggedIn}
          component={Team}
        />

        <AuthenticatedRoute
          exact
          path={routes.toRosterAdd()}
          authenticated={userIsLoggedIn}
          component={RosterAdd}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamClassroom()}
          authenticated={userIsLoggedIn}
          component={ClassroomDetails}
        />

        <AuthenticatedRoute
          exact
          path={routes.toClassroomSettings()}
          authenticated={userIsLoggedIn}
          component={ClassroomSettings}
        />

        <AuthenticatedRoute
          exact
          path={routes.toClassroomSurveyInstructions()}
          authenticated={userIsLoggedIn}
          component={SurveyInstructions}
        />

        <AuthenticatedRoute
          path={routes.toTeamClassrooms()}
          authenticated={userIsLoggedIn}
          component={Team}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamSurvey()}
          authenticated={userIsLoggedIn}
          component={Survey}
        />

        {/*
          SurveyInstructions is available on the two following routes
          because users may navigate from two different places and we use
          the route to help determine where to send the user back to when
          they click the back button.
        */}
        <AuthenticatedRoute
          exact
          path={routes.toTeamSurveyInstructions()}
          authenticated={userIsLoggedIn}
          component={SurveyInstructions}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamReports()}
          authenticated={userIsLoggedIn}
          component={Team}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamReportsSettings()}
          authenticated={userIsLoggedIn}
          component={ReportsSettings}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamOrganizations()}
          authenticated={userIsLoggedIn}
          component={TeamOrganizations}
        />

        <AuthenticatedRoute
          exact
          path={routes.toNewOrganization()}
          authenticated={userIsLoggedIn}
          component={OrganizationNew}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationDetails()}
          authenticated={userIsLoggedIn}
          component={OrganizationDetails}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganization()}
          authenticated={userIsLoggedIn}
          component={Organization}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationDashboard()}
          authenticated={userIsLoggedIn}
          component={Organization}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationReports()}
          authenticated={userIsLoggedIn}
          component={Organization}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationClassrooms()}
          authenticated={userIsLoggedIn}
          component={Organization}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationUsers()}
          authenticated={userIsLoggedIn}
          component={Organization}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationInstructions()}
          authenticated={userIsLoggedIn}
          component={OrganizationInstructions}
        />

        <AuthenticatedRoute
          exact
          path={routes.toOrganizationUsersInvite()}
          authenticated={userIsLoggedIn}
          component={OrganizationUserInvite}
        />

        <AuthenticatedRoute
          exact
          path={routes.toAttachOrganization()}
          authenticated={userIsLoggedIn}
          component={AttachOrganization}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamUsersInvite()}
          authenticated={userIsLoggedIn}
          component={TeamUserInvite}
        />

        <AuthenticatedRoute
          exact
          path={routes.toTeamUserDetails()}
          authenticated={userIsLoggedIn}
          component={UserDetails}
        />

        <AuthenticatedRoute
          exact
          path={routes.toUserDetails()}
          authenticated={userIsLoggedIn}
          component={UserDetails}
        />

        {/* Catch all route that redirects to /login */}
        <Route render={() => <Redirect to={routes.toLogin()} />} />
      </Switch>
    </ApplicationWrapper>
  </div>
);

const AppRouter = props => (
  <Router>
    <RenderWithTermsContext>
      <AppRouterRouting {...props} />
    </RenderWithTermsContext>
  </Router>
);

export default AppRouter;
