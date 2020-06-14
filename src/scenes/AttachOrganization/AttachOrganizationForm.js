import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import TermsContext from 'components/TermsContext';
import InfoBox from 'components/InfoBox';

import { formName } from 'state/form/attachOrganization';

import { AttachOrgExplainer } from '.';
import BackButton from 'components/BackButton';
import FormActions from 'components/Form/FormActions';
import Card from 'components/Card';
import TextField from 'components/Form/TextField';

// @todo(taptapdan) this default is useful as long as the org saga
// organzationAddRequest doesn't do anything because it handles the lack
// of the org in the store; you may want to remove it later.
const OrgNames = ({ orgs }) => {
  const terms = useContext(TermsContext);

  return orgs
    .map(o => (o ? <em>{o.name}</em> : <span>the {terms.organization}</span>))
    .reduce((previous, current) => [previous, ', ', current]);
};

const AttachOrganizationForm = props => {
  const terms = useContext(TermsContext);

  const {
    toBackPath,
    onSubmit, // our handler
    handleSubmit, // from reduxForm decorator on parent
    dirty,
    valid,
    error,
    attachFormSubmitting,
    submittedOrganizations,
  } = props;

  return (
    <Card>
      <Card.Header
        dark
        left={<BackButton to={toBackPath} label={dirty ? 'Cancel' : ''} />}
      >
        Join {terms.a.organization}
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AttachOrgExplainer />

          <Field
            name="organization_code"
            type="text"
            label={<>{terms.organization}&rsquo;s Invitation Code</>}
            component={TextField}
            placeholder="code"
            data-test="organization_code"
          />

          <FormActions
            mode="update"
            form={formName}
            handleSubmit={onSubmit}
            submittable={dirty && valid && !attachFormSubmitting}
            submitting={attachFormSubmitting}
            data-test="submit-actions"
          />
        </form>

        {submittedOrganizations.length > 0 && (
          <InfoBox>
            <p>
              Successfully joined <OrgNames orgs={submittedOrganizations} />.
            </p>
          </InfoBox>
        )}

        {error && (
          <InfoBox error>
            {error.message ? error.message : 'We couldn’t find that code.'}
          </InfoBox>
        )}
      </Card.Content>
    </Card>
  );
};

AttachOrganizationForm.propTypes = {
  toBackPath: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  valid: PropTypes.bool,
  attachFormSubmitting: PropTypes.bool,
  submittedOrganizations: PropTypes.array,
};

AttachOrganizationForm.defaultProps = {
  submittedOrganizations: [],
};

export default AttachOrganizationForm;
