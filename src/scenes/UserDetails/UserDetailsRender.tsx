import React from 'react';

import Card from 'components/Card';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import InfoBox from 'components/InfoBox';
import Show from 'components/Show';
import TextField from 'components/Form/TextField';
import ToggleField from 'components/Form/ToggleField';
import { Field, InjectedFormProps } from 'redux-form';

type Props = {
  form: string;
  isAdmin: boolean;
  isSelf: boolean;
};

const UserDetailsFormRender: React.FC<Props & InjectedFormProps> = props => {
  const {
    form,
    isAdmin,
    isSelf,
    // redux-form
    handleSubmit,
    invalid,
    pristine,
    submitting,
  } = props;

  const disabled = !isSelf && !isAdmin;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <Card.Header>User Details</Card.Header>
        <Card.Content>
          <Field
            component={TextField}
            label="Email Address"
            name="email"
            placeholder="Email Address"
            type="email"
            disabled
          />

          <Field
            component={TextField}
            label="Name"
            name="name"
            placeholder="Name"
            type="text"
            disabled={disabled}
          />
        </Card.Content>

        {/*
          This data isn't available when looking at someone else's details,
          even if you're a super admin, so don't display it.
        */}
        <Show when={isSelf}>
          <Card.Content>
            <Field
              component={ToggleField}
              label={
                'I consent for my data to be used in research to improve ' +
                'Copilot.'
              }
              name="consent"
              parse={Boolean}
            />
          </Card.Content>
        </Show>
      </Card>

      {/*
        This data isn't available when looking at someone else's details,
        even if you're a super admin, so don't display it.
      */}
      <Show when={isSelf}>
        <Card>
          <Card.Header>Notification Settings</Card.Header>
          <Card.Content>
            <Field
              component={ToggleField}
              label="Receive Email Notifications"
              name="receive_email"
              parse={Boolean}
              disabled={disabled}
            />
          </Card.Content>
        </Card>
      </Show>

      <FormSubmitButton
        disabled={pristine || invalid}
        handleSubmit={handleSubmit}
        submitting={submitting}
        submittingText="Saving Changes"
        data-test="submit"
      >
        Save Changes
      </FormSubmitButton>

      <FormSubmitSucceeded form={form}>
        <InfoBox success>User details saved.</InfoBox>
      </FormSubmitSucceeded>

      <FormSubmitFailed form={form}>
        {/* Using the error provided by redux-form-saga */}
      </FormSubmitFailed>

      {/*
      <Card>
        <Card.Header>Debug</Card.Header>
        <Card.Content>submitting: {submitting ? 'true' : 'false'}</Card.Content>
        <Card.Content>
          submitSucceeded: {submitSucceeded ? 'true' : 'false'}
        </Card.Content>
        <Card.Content>
          submitFailed: {submitFailed ? 'true' : 'false'}
        </Card.Content>
        <Card.Content>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </Card.Content>
        <Card.Content>
          <pre>{JSON.stringify(props.initialValues, null, 2)}</pre>
        </Card.Content>
      </Card>
      */}
    </form>
  );
};

export default UserDetailsFormRender;
