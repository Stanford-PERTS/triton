import React, { useContext } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';

import selectors from 'state/selectors';
import TermsContext from 'components/TermsContext';
import { formName } from 'state/form/attachOrganization';
import * as sharedActions from 'state/shared/actions';
import * as teamActions from 'state/teams/actions';
import * as formActions from 'state/form/attachOrganization/actions';
import * as routes from 'routes';

import fromParams from 'utils/fromParams';

import AttachOrganizationForm from './AttachOrganizationForm';

import validate from './validate';

export const AttachOrgExplainer = () => {
  const terms = useContext(TermsContext);

  return (
    <p>
      Join {terms.a.organization.toLowerCase()} to give{' '}
      {terms.organization.toLowerCase()} administrators full access to this{' '}
      {terms.team.toLowerCase()}. Only grant access to{' '}
      {terms.organizations.toLowerCase()} you trust.
    </p>
  );
};

class AttachOrganization extends React.Component {
  componentDidMount() {
    const { teamId } = fromParams(this.props);
    this.props.actions.getTeam(teamId);
  }

  onSubmit = () => {
    const { actions, formValues, team } = this.props;
    actions.attachOrganizationToTeam(formValues.organization_code, team);
  };

  componentWillUnmount(props) {
    const { actions } = this.props;
    actions.destroyAttachOrganizationFormData();
  }

  render() {
    // Explicitly passed props.
    const {
      team,
      formError,
      attachFormSubmitting,
      submittedOrganizations,
    } = this.props;
    // Props from wrapping component in reduxForm() decorator.
    const { handleSubmit, dirty, valid } = this.props;

    return (
      <AttachOrganizationForm
        toBackPath={routes.toTeamOrganizations(team.uid)}
        onSubmit={this.onSubmit}
        handleSubmit={handleSubmit}
        dirty={dirty}
        valid={valid}
        error={formError}
        attachFormSubmitting={attachFormSubmitting}
        submittedOrganizations={submittedOrganizations}
      />
    );
  }
}

AttachOrganization.defaultProps = {
  team: {},
};

const mapStateToProps = (state, props) => ({
  team: selectors.team(state, props),
  formError: selectors.organizations.attachedError(state),
  formValues: selectors.form.values(state, { form: formName }),
  attachFormSubmitting: selectors.form.submitting(state, { form: formName }),
  submittedOrganizations: selectors.organizations.attached.list(state),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...sharedActions,
      ...teamActions,
      ...formActions,
    },
    dispatch,
  ),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  reduxForm({ form: formName, validate }),
)(AttachOrganization);
