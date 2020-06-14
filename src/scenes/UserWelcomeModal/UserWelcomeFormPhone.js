import React from 'react';
import { Field, reduxForm } from 'redux-form';
import PropTypes from 'prop-types';

import PhoneField from 'components/Form/PhoneField';
import Button from 'components/Button';

import validate from './validate';

const UserWelcomeFormSecondPage = props => {
  const { handleSubmit, pristine } = props;

  return (
    <form className="UserWelcomeFormSecondPage" onSubmit={handleSubmit}>
      <Field
        component={PhoneField}
        name="phone_number"
        type="text"
        country="US"
        placeholder="Mobile Number (optional)"
      />
      <Button className="submit block" disabled={pristine} type="submit">
        Submit
      </Button>
    </form>
  );
};

UserWelcomeFormSecondPage.propTypes = {
  previousPage: PropTypes.func,
};

export default reduxForm({
  form: 'welcome',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate,
})(UserWelcomeFormSecondPage);
