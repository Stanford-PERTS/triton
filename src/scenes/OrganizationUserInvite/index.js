import React from 'react';
import { compose, defaultProps, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import withLoading from 'utils/withLoading';
import validate from 'scenes/UserDetails/validate';
import isEmail from 'validator/lib/isEmail';

import fromParams from 'utils/fromParams';
import formAction from 'state/form/organizationUserInvite/actions';
import * as organizationsActions from 'state/organizations/actions';
import * as usersActions from 'state/users/actions';
import selectors from 'state/selectors';

import OrganizationUserInviteLoading from './OrganizationUserInviteLoading';
import OrganizationUserInviteRender from './OrganizationUserInviteRender';
import OrganizationUserInviteWrapper from './OrganizationUserInviteWrapper';

const form = 'userInvite';

const mapStateToProps = (state, props) => ({
  formValues: selectors.form.values(state, { form }),
  organization: selectors.organization(state, props),
  isLoading: selectors.loading.organizations(state, props),
  userExists: selectors.form.values(state, { form }).existingUser,
  usersOnOrg: selectors.organization.users.list(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    { ...organizationsActions, ...usersActions },
    dispatch,
  ),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organization, usersOnOrg } = this.props;
      const { organizationId } = fromParams(this.props);
      const { getOrganization, queryUsersByOrganization } = this.props.actions;

      // We won't have loaded org if we navigated here directly.
      if (!organization) {
        getOrganization(organizationId);
      }

      // We won't have loaded org users if we navigated here directly. There
      // isn't a way to know for sure if we've already attempted to load users,
      // so let's use the fact that there are 0 users as our best indicator.
      if (usersOnOrg.length === 0) {
        queryUsersByOrganization(organizationId);
      }
    },
  }),
  // Make handlers & props available to child components
  Component => props => {
    const handlers = {
      checkUserExists(event) {
        const { checkUserExists } = props.actions;
        const email = event.target.value;

        if (isEmail(email)) {
          checkUserExists(email);
        }
      },
    };

    const userExistsAsMember = Boolean(
      props.usersOnOrg.find(u => u.uid === props.formValues.uid),
    );

    return (
      <Component
        {...props}
        {...handlers}
        userExistsAsMember={userExistsAsMember}
      />
    );
  },
  defaultProps({
    initialValues: {
      // Set the Receive Email Notifications toggle on initially.
      receive_email: true,
    },
  }),
  reduxFormOnSubmit(formAction, {
    propsToInclude: ['organization'],
  }),
  reduxForm({
    form,
    validate,
    // Necessary for `pristine` prop to update properly after form submit.
    enableReinitialize: true,
  }),
  withLoading({
    WhenLoadingComponent: OrganizationUserInviteLoading,
    WrapperComponent: OrganizationUserInviteWrapper,
  }),
)(OrganizationUserInviteRender);
