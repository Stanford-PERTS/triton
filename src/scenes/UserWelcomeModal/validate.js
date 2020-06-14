import { isValidPhoneNumber } from 'react-phone-number-input';

export const VALIDATE_REAL_NAME_REQUIRED = 'Name required.';
export const VALIDATE_REAL_PHONE_NUMBER_INVALID =
  'Invalid phone number entered.';

export default values => {
  const errors = {};

  /* Required Fields */
  errors.name = !values.name ? VALIDATE_REAL_NAME_REQUIRED : null;

  /* Additional Validaton */
  // Phone Number Validation
  if (values.phone_number) {
    errors.phone_number = !isValidPhoneNumber(values.phone_number)
      ? VALIDATE_REAL_PHONE_NUMBER_INVALID
      : null;
  }

  return errors;
};
