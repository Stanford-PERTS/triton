import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { compose, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import fromParams from 'utils/fromParams';
import * as route from 'routes';
import * as organizationActions from 'state/organizations/actions';
import selectors from 'state/selectors';
import TermsContext from 'components/TermsContext';

import { OrganizationCodeText } from 'scenes/OrganizationCode';
import BackButton from 'components/BackButton';
import Card from 'components/Card';
import FormButton from 'components/Form/FormButton';

const OrganizationInstructions = props => {
  const terms = useContext(TermsContext);
  const { organization } = props;

  const toBackRoute = route.toOrganization(organization.uid);

  const handleCodeChange = () => {
    const { organizationId } = fromParams(props);
    props.actions.changeOrganizationCode(organizationId);
  };

  return (
    <Card>
      <Card.Header dark left={<BackButton to={toBackRoute} />}>
        Invite {terms.teams} to this {terms.organization}
      </Card.Header>
      <OrganizationCodeText />
      <Card.Content>
        <FormButton
          handleSubmit={handleCodeChange}
          submittable={true}
          submitting={false}
          confirmationPrompt={
            <span>
              Are you sure you want to change the code? Existing codes you may
              have distributed will no longer work.
            </span>
          }
          confirmationButtonText={
            <span>Change the code (there&rsquo;s no way to undo)</span>
          }
        >
          Change Code
        </FormButton>
      </Card.Content>
    </Card>
  );
};

OrganizationInstructions.defaultProps = {
  organization: {},
};

OrganizationInstructions.propTypes = {
  organization: PropTypes.object,
};

const mapStateToProps = (state, props) => ({
  initialValues: selectors.organization(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(organizationActions, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organizationId } = fromParams(this.props);
      this.props.actions.getOrganization(organizationId);
    },
  }),
  reduxForm({
    form: 'organization',
    enableReinitialize: true,
  }),
)(OrganizationInstructions);
