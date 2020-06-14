import isLength from 'validator/lib/isLength';

export const VALIDATE_PASSWORD_REQUIRED = 'Password required.';
export const VALIDATE_PASSWORD_LENGTH =
  'Password must be 8 or more characters in length.';
export const VALIDATE_PASSWORD_MUST_MATCH = 'Passwords must match.';

export default (values, props) => {
  const errors = { ...props.formSyncErrors }; // may have token error

  /* Required Fields */
  errors.password = !values.password ? VALIDATE_PASSWORD_REQUIRED : null;

  /* Passwords entered must match */
  errors.passwordConfirm =
    values.password !== values.passwordConfirm
      ? VALIDATE_PASSWORD_MUST_MATCH
      : null;

  // Password Strength
  if (values.password) {
    errors.password = !isLength(values.password, { min: 8 })
      ? VALIDATE_PASSWORD_LENGTH
      : null;
  }

  return errors;
};
