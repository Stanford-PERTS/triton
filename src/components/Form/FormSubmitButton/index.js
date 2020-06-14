import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';

const FormSubmitButton = ({
  children,
  handleSubmit,
  submitting,
  submittingText,
  ...rest
}) => (
  <Button
    loading={submitting}
    loadingText={submittingText}
    onClick={handleSubmit}
    data-test="submit-button"
    {...rest}
  >
    {children}
  </Button>
);

FormSubmitButton.propTypes = {
  // Default text that appears on the button.
  children: PropTypes.node.isRequired,
  // Disable the button, typically `disabled={pristine || invalid}`.
  disabled: PropTypes.bool,
  // redux-form `handleSubmit` function prop.
  // https://redux-form.com/6.6.3/docs/api/props.md/
  handleSubmit: PropTypes.func.isRequired,
  // redux-form `submitting` prop.
  submitting: PropTypes.bool.isRequired,
  // Text that appears on the button while `submitting`.
  submittingText: PropTypes.string.isRequired,
};

export default FormSubmitButton;
