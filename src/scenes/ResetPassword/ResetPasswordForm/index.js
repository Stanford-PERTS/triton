import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';

import validate from './validate';
import selectors from 'state/selectors';

import ErrorField from 'components/Form/ErrorField';
import TextField from 'components/Form/TextField';
import Button from 'components/Button';

const PasswordResetForm = ({ handleSubmit, onSubmit, authenticating }) => (
  <form className="PasswordResetForm" onSubmit={handleSubmit(onSubmit)}>
    <Field
      label="Email Address"
      name="email"
      component={TextField}
      type="email"
      placeholder="Email Address"
    />
    <Button
      loading={authenticating}
      loadingText="Requesting reset password email"
      type="submit"
      secondary
    >
      Reset password
    </Button>
    <Field name="_form" component={ErrorField} />
  </form>
);

const mapStateToProps = (state, props) => ({
  authenticating: selectors.auth.authenticating(state, props),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({ form: 'reset', validate }),
)(PasswordResetForm);
