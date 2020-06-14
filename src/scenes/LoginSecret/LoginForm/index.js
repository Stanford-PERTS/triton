import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';

import selectors from 'state/selectors';

import validate from './validate';

import ErrorField from 'components/Form/ErrorField';
import TextField from 'components/Form/TextField';
import Button from 'components/Button';

const LoginForm = ({ handleSubmit, onSubmit, authenticating }) => (
  <form className="LoginForm" onSubmit={handleSubmit(onSubmit)}>
    <Field
      label="Email Address"
      name="email"
      component={TextField}
      type="email"
      placeholder="Email Address"
    />
    <Field
      label="Password"
      name="password"
      component={TextField}
      type="password"
      placeholder="Password"
    />
    <Button
      className="LoginFormSubmit"
      loading={authenticating}
      loadingText="Verifying email and password"
      type="submit"
      secondary
    >
      Sign in
    </Button>
    <Field name="_form" component={ErrorField} />
  </form>
);

const mapStateToProps = (state, props) => ({
  authenticating: selectors.auth.authenticating(state, props),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({ form: 'login', validate }),
)(LoginForm);
