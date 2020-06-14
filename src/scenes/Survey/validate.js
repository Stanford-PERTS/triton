import { isURL } from 'validator';

export const INVALID_URL = 'Please enter a valid, secure URL (https).';

export const VALIDATE_METRIC_REQUIRED =
  'Please choose at least one learning condition.';

/**
 * Validator function for the survey form.
 * @param  {Object} values current values in the form
 * @return {Object}        may have properties that match the `name` of a Field
 *                         in the form. If any of those properties have truthy
 *                         values, they will be passed to corresponding Field
 *                         components in the `meta` prop so they can display
 *                         error messages. By convention we use the `_form` name
 *                         for ErrorFields which pertain to the validity of the
 *                         whole form.
 */
export default values => {
  const errors = {};

  // If user has selected to use a digital artifact...
  if (values.meta.artifact_use === 'true') {
    if (
      // Error if the field is empty.
      (values.meta && !values.meta.artifact_url) ||
      // Error if not a valid, secure URL.
      // https://github.com/validatorjs/validator.js
      !isURL(values.meta.artifact_url, { protocols: ['https'] })
    ) {
      errors.meta = errors.meta || {};
      errors.meta.artifact_url = INVALID_URL;
    }
  }

  if (values.metrics && values.metrics.every(m => !m.metricActive)) {
    errors._form = VALIDATE_METRIC_REQUIRED;
  }

  return errors;
};
