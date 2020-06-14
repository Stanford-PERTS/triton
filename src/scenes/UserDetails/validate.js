import isEmail from 'validator/lib/isEmail';

export const VALIDATE_REAL_NAME_REQUIRED = 'Name required.';
export const VALIDATE_USER_EMAIL_REQUIRED = 'Email address required.';
export const VALIDATE_USER_EMAIL_INVALID = 'Invalid email address entered.';

export default values => {
  const errors = {};

  /* Required Fields */
  // If user does not already exist in the system, then validate name field.
  // This is necessary because a user may end up in the system that does not
  // have a valid name.
  if (!values.existingUser) {
    errors.name = values.name ? null : VALIDATE_REAL_NAME_REQUIRED;
  }

  errors.email = values.email ? null : VALIDATE_USER_EMAIL_REQUIRED;

  /* Additional Validaton */
  if (values.email) {
    errors.email = isEmail(values.email) ? null : VALIDATE_USER_EMAIL_INVALID;
  }

  return errors;
};
