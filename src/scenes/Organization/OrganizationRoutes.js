import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, Switch } from 'react-router-dom';

import * as routes from 'routes';
import selectors from 'state/selectors';

import OrganizationDashboard from 'scenes/OrganizationDashboard';
import OrganizationReports from 'scenes/OrganizationReports';
import OrganizationTeams from 'scenes/OrganizationTeams';
import OrganizationClassrooms from 'scenes/OrganizationClassrooms';
import OrganizationUsers from 'scenes/OrganizationUsers';
import AuthenticatedRoute from 'components/AuthenticatedRoute';

const OrganizationRoutes = ({ userIsLoggedIn }) => (
  <Switch>
    <AuthenticatedRoute
      path={routes.toOrganizationTeams()}
      authenticated={userIsLoggedIn}
      component={OrganizationTeams}
    />

    <AuthenticatedRoute
      exact
      path={routes.toOrganizationDashboard()}
      authenticated={userIsLoggedIn}
      component={OrganizationDashboard}
    />

    <AuthenticatedRoute
      exact
      path={routes.toOrganizationReports()}
      authenticated={userIsLoggedIn}
      component={OrganizationReports}
    />

    <AuthenticatedRoute
      path={routes.toOrganizationClassrooms()}
      authenticated={userIsLoggedIn}
      component={OrganizationClassrooms}
    />
    <AuthenticatedRoute
      path={routes.toOrganizationUsers()}
      authenticated={userIsLoggedIn}
      component={OrganizationUsers}
    />
  </Switch>
);

function mapStateToProps(state, props) {
  return {
    userIsLoggedIn: selectors.auth.user.isLoggedIn(state, props),
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(OrganizationRoutes);
