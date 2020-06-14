import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';

import TermsContext from 'components/TermsContext';
import selectors from 'state/selectors';

import OrganizationCode from 'scenes/OrganizationCode';
import Card from 'components/Card';
import BackButton from 'components/BackButton';
import ErrorField from 'components/Form/ErrorField';
import FormActions from 'components/Form/FormActions';
import PhoneField from 'components/Form/PhoneField';
import Show from 'components/Show';
import TextArea from 'components/Form/TextArea';
import TextField from 'components/Form/TextField';

import validate from './validate';

const OrganizationDetailsForm = props => {
  const terms = useContext(TermsContext);

  const { program } = props;

  // from OrganizationDetails
  const { formMode, mayDelete, toBack } = props;
  const { handleDelete, onSubmit } = props;
  // from mapStateToProps
  const { deleting, submitting } = props;
  // from redux-form
  const { handleSubmit, submit, valid, dirty } = props;

  // form is submittable if fields are dirty AND valid
  const submittable = dirty && valid && !submitting;

  const sendInvitations = ''; // hook into sending org invitations?

  // Since we won't be displaying the Organization Settings card, which
  // contains the main save button, for mset19, let's show it in the Name card.
  const showSaveButtonInNameCard =
    formMode !== 'add' || (program && program.label === 'mset19');

  // Hide the Organization Settings card (address) for mset19 since we're using
  // the organization functionality for Collections instead.
  const showOrganizationSettings = program && program.label !== 'mset19';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Card.Header
          dark
          left={toBack && <BackButton to={toBack} label="Cancel" />}
        >
          {formMode === 'add' ? (
            <span>Start {terms.a.organization}</span>
          ) : (
            <span>{terms.organization} Settings</span>
          )}
        </Card.Header>
      </Card>

      <Card>
        <Card.Header>{terms.organization} Name</Card.Header>
        <Card.Content>
          <Field
            component={TextField}
            label={`${terms.organization} Name`}
            name="name"
            placeholder={`Enter ${terms.organization} Name`}
            type="text"
          />
        </Card.Content>

        <Show when={showSaveButtonInNameCard}>
          <Card.Content>
            <FormActions
              mode={formMode}
              form="organization"
              displayEntity={terms.organization}
              handleSubmit={submit}
              submitAnd={sendInvitations}
              submittable={submittable}
              submitting={submitting}
            />
          </Card.Content>
        </Show>
      </Card>

      <Show when={formMode !== 'add'}>
        <OrganizationCode />
      </Show>

      <Show when={showOrganizationSettings}>
        <Card>
          <Card.Header>{terms.organization} Settings</Card.Header>
          <Card.Content>
            <Field
              component={TextArea}
              name="mailing_address"
              label="Mailing Address"
              placeholder="Enter Mailing Address"
              type="text"
            />

            <Field
              component={PhoneField}
              name="phone_number"
              label="Phone Number"
              placeholder="Enter Phone Number"
              type="text"
              country="US"
            />
          </Card.Content>
          <Card.Content>
            <FormActions
              mode={formMode}
              form="organization"
              displayEntity={terms.organization}
              handleSubmit={submit}
              submitAnd={sendInvitations}
              submittable={submittable}
              submitting={submitting}
            />
          </Card.Content>
        </Card>
      </Show>

      <Field name="_form" component={ErrorField} />

      <FormActions
        mode={formMode}
        form="organization"
        displayEntity={terms.organization}
        deleting={deleting}
        handleDelete={handleDelete}
        mayDelete={mayDelete}
      />
    </form>
  );
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
  // redux-form values
  initialValues: props.organization,
  // status flags
  deleting: selectors.deleting.organizations(state),
  submitting: selectors.form.submitting(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: 'organization',
    enableReinitialize: true,
    // Redirecting from OrganizationNew to OrganizationDetails, when adding a
    // new organization, results in loss of form data without this setting.
    destroyOnUnmount: false,
    validate,
  }),
)(OrganizationDetailsForm);
