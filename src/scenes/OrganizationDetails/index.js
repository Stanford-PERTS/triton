import React from 'react';
// import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as organizationFormActions from 'state/form/organization/actions';
import * as organizationsActions from 'state/organizations/actions';
import * as usersActions from 'state/users/actions';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';

import OrganizationDetailsForm from './OrganizationDetailsForm';
import Loading from 'components/Loading';

class OrganizationDetails extends React.Component {
  componentDidMount() {
    const { organizationId } = fromParams(this.props);
    const { formMode } = this.props;
    const {
      getOrganization,
      queryUsersByOrganization,
      setOrganizationMode,
    } = this.props.actions;

    getOrganization(organizationId);
    queryUsersByOrganization(organizationId);

    if (formMode === 'add') {
      setOrganizationMode('afterAdd');
    } else {
      setOrganizationMode('update');
    }
  }

  handleSubmit = () => {
    const { organizationFormValues } = this.props;
    const { submitOrganizationForm } = this.props.actions;

    submitOrganizationForm(organizationFormValues);
  };

  handleDelete = () => {
    const { actions } = this.props;
    const { organizationId } = fromParams(this.props);
    actions.removeOrganization(organizationId);
  };

  render() {
    const { organization, users } = this.props;
    const { formMode } = this.props;
    const { hasOrganizationPermission } = this.props;

    if (!organization || !users) {
      return <Loading />;
    }

    return (
      <OrganizationDetailsForm
        // app data
        organization={organization}
        users={users}
        // form data & functions
        formMode={formMode}
        handleDelete={this.handleDelete}
        onSubmit={this.handleSubmit}
        // permissions
        mayDelete={hasOrganizationPermission}
      />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    formMode: state.entities.organizations.organizationMode,
    hasOrganizationPermission: selectors.authUser.hasOrganizationPermission(
      state,
      props,
    ),
    organization: selectors.organization(state, props),
    organizationFormValues: selectors.form.values(state, {
      form: 'organization',
    }),
    users: selectors.organization.users(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...organizationsActions,
        ...organizationFormActions,
        ...usersActions,
      },
      dispatch,
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrganizationDetails);
