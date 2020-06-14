import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as routes from 'routes';
import selectors from 'state/selectors';

import Card from 'components/Card';

const mapStateToProps = (state, props) => ({
  hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
});

type Props = {
  hasCaptainPermission?: boolean;
};

const TeamComponent: React.FC<Props> = ({ hasCaptainPermission }) =>
  hasCaptainPermission ? (
    <Card.Content to={routes.toCycleProgressTeam()}>
      View Detailed Survey Progress
    </Card.Content>
  ) : null;

export const TaskCycleProgressLinkTeam = compose(
  withRouter,
  connect(mapStateToProps),
)(TeamComponent);

const UserComponent: React.FC<Props> = ({ hasCaptainPermission }) =>
  hasCaptainPermission ? null : (
    <Card.Content to={routes.toCycleProgressUser()}>
      View Detailed Survey Progress
    </Card.Content>
  );

export const TaskCycleProgressLinkUser = compose(
  withRouter,
  connect(mapStateToProps),
)(UserComponent);
