import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { isDirty } from 'redux-form';

import fromParams from 'utils/fromParams';
import * as routes from 'routes';

import BackButton from 'components/BackButton';
import Card from 'components/Card';

const OrganizationUserInviteWrapper = props => {
  const { children, dirty } = props;
  const { organizationId } = fromParams(props);

  // Display "Cancel" on the BackButton if the form is dirty.
  const cancelLabel = dirty ? 'Cancel' : false;

  // Determine the BackButton props.
  const backButtonProps = {
    to: routes.toOrganizationUsers(organizationId),
    label: cancelLabel,
  };

  return (
    <>
      <Card>
        <Card.Header dark left={<BackButton {...backButtonProps} />}>
          New User
        </Card.Header>
      </Card>
      {children}
    </>
  );
};

const mapStateToProps = (state, props) => ({
  dirty: isDirty(props.form)(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(OrganizationUserInviteWrapper);
