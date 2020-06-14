import React from 'react';
import { connect } from 'react-redux';
import { Field, getFormSyncErrors, reduxForm } from 'redux-form';
import { compose } from 'recompose';

import validate from './validate';
import selectors from 'state/selectors';

import ErrorField from 'components/Form/ErrorField';
import TextField from 'components/Form/TextField';
import Button from 'components/Button';

const form = 'setPassword';

const SetPasswordForm = props => {
  const {
    authenticating,
    disabled,
    email,
    formSyncErrors,
    handleSubmit,
    onSubmit,
  } = props;

  const { _form: formError } = formSyncErrors;

  return (
    <form className="SetPasswordForm" onSubmit={handleSubmit(onSubmit)}>
      {email && (
        <Field
          component={TextField}
          label="Email"
          name="email"
          type="text"
          disabled
        />
      )}

      <Field
        label="Password"
        name="password"
        component={TextField}
        type="password"
        placeholder="Enter your password"
        disabled={disabled || formError}
      />

      <Field
        label="Confirm Password"
        name="passwordConfirm"
        component={TextField}
        type="password"
        placeholder="Re-enter your password"
        disabled={disabled || formError}
      />

      <Button
        loading={authenticating || disabled}
        loadingText="Saving your password"
        type="submit"
        secondary
        disabled={Boolean(formError)}
      >
        Save your password
      </Button>
      <Field name="_form" component={ErrorField} />
    </form>
  );
};

const mapStateToProps = (state, props) => ({
  authenticating: selectors.auth.authenticating(state, props),
  initialValues: { email: props.email },
  formSyncErrors: getFormSyncErrors(form)(state),
});

export default compose(
  connect(mapStateToProps),
  // By default, you may only initialize a form component once via initialValues
  // Since email won't be ready on the initial form render, the form needs to be
  // able to reinitialize. `enableReinitialize: true` allows this.
  // https://redux-form.com/6.7.0/examples/initializefromstate/
  reduxForm({ form, validate, enableReinitialize: true }),
)(SetPasswordForm);
