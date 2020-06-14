import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';

import TextField from 'components/Form/TextField';
import Button from 'components/Button';

import validate from './validate';

export const shouldDisplay = (program, user) => !user.name;

const UserWelcomeFormName = props => {
  const { handleSubmit, pristine } = props;

  return (
    <form className="UserWelcomeFormName" onSubmit={handleSubmit}>
      <div className="UserWelcomeTitle">Welcome to Copilot!</div>

      <Field
        name="name"
        component={TextField}
        placeholder="Name"
        label="What is your name?"
      />
      <Button data-test="next" disabled={pristine} type="submit">
        Next
      </Button>
      <div className="UserWelcomeContent">
        <p>
          <em>You can always change these details in your account settings.</em>
        </p>
      </div>
    </form>
  );
};

UserWelcomeFormName.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default reduxForm({
  form: 'welcome',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate,
})(UserWelcomeFormName);
