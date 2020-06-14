export const VALIDATE_ORGANIZATION_NAME_REQUIRED = 'Name required.';

export default values => {
  const errors = {};

  /* Required Fields */
  errors.name = values.name ? null : VALIDATE_ORGANIZATION_NAME_REQUIRED;

  return errors;
};
