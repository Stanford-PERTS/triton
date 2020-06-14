export const VALIDATE_ORGANIZATION_CODE_REQUIRED = 'Code required.';

export default values => {
  const errors = {};

  /* Required Fields */
  errors.code = values.organization_code
    ? null
    : VALIDATE_ORGANIZATION_CODE_REQUIRED;

  return errors;
};
