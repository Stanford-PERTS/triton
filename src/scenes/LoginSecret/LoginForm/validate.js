import isEmail from 'validator/lib/isEmail';

export const VALIDATE_LOGIN_EMAIL_REQUIRED = 'Email address required.';
export const VALIDATE_LOGIN_EMAIL_INVALID = 'Invalid email address entered.';
export const VALIDATE_LOGIN_PERTS_ONLY =
  'Logins here are only for perts.net accounts.';
export const VALIDATE_LOGIN_PASSWORD_REQUIRED = 'Password required';

export default values => {
  const errors = {};

  /* Required Fields */
  errors.email = !values.email ? VALIDATE_LOGIN_EMAIL_REQUIRED : null;
  errors.password = !values.password ? VALIDATE_LOGIN_PASSWORD_REQUIRED : null;

  /* Additional Validaton */
  // PERTS accounts only
  if (values.email) {
    errors.email =
      values.email.indexOf('@perts.net') === -1
        ? VALIDATE_LOGIN_PERTS_ONLY
        : null;
  }

  // Email Validation
  if (values.email) {
    errors.email = !isEmail(values.email) ? VALIDATE_LOGIN_EMAIL_INVALID : null;
  }

  // Password Validation
  // We probably don't want to/need to provide validation for passwords in
  // real time. We'll just let the server handle authenticating.

  return errors;
};
