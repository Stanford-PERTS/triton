import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, Switch } from 'react-router-dom';

import * as routes from 'routes';
import selectors from 'state/selectors';

import TeamClassrooms from 'scenes/TeamClassrooms';
import TeamTasklist from 'scenes/TeamTasklist';
import Reports from 'scenes/Reports';
import Survey from 'scenes/Survey';
import AuthenticatedRoute from 'components/AuthenticatedRoute';

const TeamRoutes = ({ userIsLoggedIn }) => (
  <Switch>
    <AuthenticatedRoute
      path={routes.toTeamClassrooms()}
      authenticated={userIsLoggedIn}
      component={TeamClassrooms}
    />

    <AuthenticatedRoute
      path={routes.toTeamSurvey()}
      authenticated={userIsLoggedIn}
      component={Survey}
    />

    <AuthenticatedRoute
      exact
      path={routes.toTeamReports()}
      authenticated={userIsLoggedIn}
      component={Reports}
    />

    <AuthenticatedRoute
      path={routes.toProgramModule()}
      authenticated={userIsLoggedIn}
      component={TeamTasklist}
    />

    <AuthenticatedRoute
      path={routes.toProgramSteps()}
      authenticated={userIsLoggedIn}
      component={TeamTasklist}
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
)(TeamRoutes);
