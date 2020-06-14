import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import capitalize from 'lodash/capitalize';
import isEmpty from 'lodash/isEmpty';

import Button from 'components/Button';

const SubmitButton = props => {
  const {
    and,
    className,
    displayEntity,
    form: formName,
    mode,
    submitting,
    ...rest
  } = props;
  const classes = classnames('SubmitButton', className);

  const form = formName.toLowerCase();
  const displayText = capitalize(displayEntity || form);

  const [submitText, submittingText] = (m => {
    switch (m) {
      case 'add':
        return [`Save New ${displayText}`, `Saving New ${displayText}`];
      case 'invite':
        return [`Add ${displayText}`, `Adding ${displayText}`];
      case 'afterAdd':
      case 'update':
        return ['Save Changes', 'Saving Changes'];
      default:
        return ['Submit', 'Submitting'];
    }
  })(mode);
  const submitButtonText = submitText + (!isEmpty(and) ? ` and ${and}` : '');

  return (
    <Button
      {...rest}
      className={classes}
      loading={submitting}
      loadingText={submittingText}
    >
      {submitButtonText}
    </Button>
  );
};

SubmitButton.propTypes = {
  // Additional text for submit button. Use when submit does multiple things.
  and: PropTypes.string,
  className: PropTypes.string,
  // Name of form, used for submit button text
  form: PropTypes.string,
  // Mode of form, used for submit button text
  mode: PropTypes.string,
  // Form is submitting
  submitting: PropTypes.bool,
};

export default SubmitButton;
