import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isDirty } from 'redux-form';

import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import * as routes from 'routes';

import BackButton from 'components/BackButton';
import Card from 'components/Card';

const UserDetailsFormWrapper = props => {
  const { children, dirty, program, user = {} } = props;
  const { teamId, stepType, parentLabel } = fromParams(props);

  // Display "Cancel" on the BackButton if the form is dirty.
  const cancelLabel = dirty ? 'Cancel' : false;

  // Determine the BackButton props.
  let to, toLabel;
  if (parentLabel) {
    to = routes.toProgramTeamUsers(teamId, stepType, parentLabel);
    toLabel = cancelLabel;
  } else if (teamId) {
    to = routes.toTeamUsers(teamId);
    toLabel = cancelLabel;
  } else if (program) {
    to = routes.toHome(program.label);
    toLabel = cancelLabel || 'Home';
  } else {
    to = routes.toHomeNoProgram();
    toLabel = cancelLabel || 'Home';
  }

  return (
    <>
      <Card>
        <Card.Header dark left={<BackButton to={to} label={toLabel} />}>
          {user.name || user.email}
        </Card.Header>
      </Card>
      {children}
    </>
  );
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
  dirty: isDirty(props.form)(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(UserDetailsFormWrapper);
