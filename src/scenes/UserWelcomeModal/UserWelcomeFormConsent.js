import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';

import { EPConsent } from 'components/ConsentText';

import validate from './validate';

const consentComponents = {
  ep19: EPConsent,
};

export const shouldDisplay = (program, user) =>
  program.label in consentComponents && user.consent === null;

const UserWelcomeFormConsent = props => {
  const { handleSubmit, program } = props;

  const ConsentText = consentComponents[program.label];
  if (!ConsentText) {
    throw new Error(`No ConsentText set for program ${program.label}`);
  }

  return (
    <form className="UserWelcomeFormConsent" onSubmit={handleSubmit}>
      <div className="UserWelcomeTitle">Welcome to Copilot!</div>

      <EPConsent />

      <div className="UserWelcomeContent">
        <p>
          <em>You can always change these details in your account settings.</em>
        </p>
      </div>
    </form>
  );
};

UserWelcomeFormConsent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  program: PropTypes.object.isRequired,
};

export default reduxForm({
  form: 'welcome',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  initialValues: { noConsent: false },
  validate,
})(UserWelcomeFormConsent);
