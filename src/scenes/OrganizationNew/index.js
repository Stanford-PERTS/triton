import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as organizationFormActions from 'state/form/organization/actions';
import * as organizationsActions from 'state/organizations/actions';
import * as routes from 'routes';
import selectors from 'state/selectors';
import { getDefaultOrganization } from 'services/triton/organizations';

import OrganizationDetailsForm from 'scenes/OrganizationDetails/OrganizationDetailsForm';

class OrganizationNew extends React.Component {
  componentDidMount() {
    const { setOrganizationMode } = this.props.actions;

    setOrganizationMode('add');
  }

  handleAddOrganization = () => {
    const { organizationFormValues, program } = this.props;
    const { submitNewOrganizationForm } = this.props.actions;

    submitNewOrganizationForm({
      program_id: program.uid,
      ...organizationFormValues,
    });
  };

  render() {
    const { formMode, program, userLoggedIn } = this.props;

    const organization = getDefaultOrganization();
    const toBack = program
      ? routes.toHome(program.label)
      : routes.toHomeNoProgram();

    return (
      <OrganizationDetailsForm
        // data
        organization={organization}
        program={program}
        users={[userLoggedIn]}
        // form data & functions
        formMode={formMode}
        toBack={toBack}
        onSubmit={this.handleAddOrganization}
      />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    // data
    organizationFormValues: selectors.form.values(state, {
      form: 'organization',
    }),
    program: selectors.program(state, props),
    userLoggedIn: selectors.auth.user(state, props),
    // meta
    formMode: state.entities.organizations.organizationMode,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...organizationsActions, ...organizationFormActions },
      dispatch,
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrganizationNew);
