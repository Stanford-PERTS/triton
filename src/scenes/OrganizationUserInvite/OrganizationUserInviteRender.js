import React, { useContext } from 'react';

import TermsContext from 'components/TermsContext';
import { Field } from 'redux-form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import TextField from 'components/Form/TextField';
import ToggleField from 'components/Form/ToggleField';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';

const OrganizationUserInviteRender = props => {
  const terms = useContext(TermsContext);
  const {
    checkUserExists,
    form,
    handleSubmit,
    invalid,
    pristine,
    submitting,
    userExists,
    userExistsAsMember,
  } = props;

  const termsClassrooms = terms.classrooms.toLowerCase();
  const termsOrganization = terms.organization.toLowerCase();
  const termsTeams = terms.teams.toLowerCase();

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <Card.Header>User Details</Card.Header>
        <Card.Content centered>
          Enter a colleague&rsquo;s email address below to invite them to this{' '}
          {termsOrganization}. They will be able to manage all the {termsTeams}{' '}
          associated with this {termsOrganization}, but they will not see the
          results of individual {termsClassrooms}.
        </Card.Content>
        <Card.Content>
          <Field
            component={TextField}
            label="Email Address"
            name="email"
            placeholder="Email Address"
            type="email"
            onBlur={checkUserExists}
          />

          <Field
            component={TextField}
            label="Name"
            name="name"
            placeholder="Name"
            type="text"
            disabled={userExists}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>Notification Settings</Card.Header>
        <Card.Content>
          <Field
            component={ToggleField}
            label="Receive Email Notifications"
            name="receive_email"
            parse={Boolean}
            disabled={userExists}
          />
        </Card.Content>
      </Card>

      <InfoBox>
        {userExistsAsMember ? (
          <span>
            This user is already a member. You can resend an invitation to this
            user from their options menu.
          </span>
        ) : userExists ? (
          <span>
            A user with that email address already has an account. They&rsquo;ll
            still get an invitation.
          </span>
        ) : (
          <span>An invitation will be sent to the user&rsquo;s email.</span>
        )}
      </InfoBox>

      <FormSubmitButton
        disabled={pristine || invalid || userExistsAsMember}
        handleSubmit={handleSubmit}
        submitting={submitting}
        submittingText="Sending Invite"
      >
        Send Invite
      </FormSubmitButton>

      <FormSubmitSucceeded form={form}>
        <InfoBox success>Invite sent.</InfoBox>
      </FormSubmitSucceeded>

      <FormSubmitFailed form={form}>
        {/* Using the error provided by redux-form-saga */}
      </FormSubmitFailed>
    </form>
  );
};

export default OrganizationUserInviteRender;
