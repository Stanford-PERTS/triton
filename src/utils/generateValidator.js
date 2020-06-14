// generateValidator creates a validate function for redux-form forms.

// Note: All fields, not just the ones specified, will be validated using the
// `maxLengthGlobal` validation function.
//
// Example usage:
//   const validate = generateValidator({
//     required: {
//       name: 'Please enter your name.',
//       email: 'Please enter your email address.',
//     },
//   });
//
//  reduxForm({
//    form: 'FormToBeValidated',
//    validate,
//  }),

import { maxLengthGlobal } from 'utils/validate';
import forEach from 'lodash/forEach';

export const DEFAULT_REQUIRED = 'Please respond.';

function generateValidator({ required }) {
  return function validate(values) {
    const errors = {};

    // Required fields
    forEach(required, (message, key) => {
      errors[key] = values[key] ? null : message || DEFAULT_REQUIRED;
    });

    // All fields are validated on global maxLength
    forEach(values, (value, key) => {
      const validationError = maxLengthGlobal(value);
      if (validationError) {
        errors[key] = validationError;
      }
    });

    return errors;
  };
}

export default generateValidator;
