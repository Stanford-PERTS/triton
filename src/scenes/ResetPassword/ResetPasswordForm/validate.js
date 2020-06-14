import isEmail from 'validator/lib/isEmail';

export const VALIDATE_LOGIN_EMAIL_REQUIRED = 'Email address required.';
export const VALIDATE_LOGIN_EMAIL_INVALID = 'Invalid email address entered.';

export default values => {
  const errors = {};

  /* Required Fields */
  errors.email = !values.email ? VALIDATE_LOGIN_EMAIL_REQUIRED : null;

  /* Additional Validaton */
  // Email Validation
  if (values.email) {
    errors.email = !isEmail(values.email) ? VALIDATE_LOGIN_EMAIL_INVALID : null;
  }

  // Password Validation
  // We probably don't want to/need to provide validation for passwords in
  // real time. We'll just let the server handle authenticating.

  return errors;
};
