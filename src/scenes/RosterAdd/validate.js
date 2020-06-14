export const ID_PATTERN = /^\S{3,}$/;

export const VALIDATE_STUDENT_ID_REQUIRED =
  'At least one Student ID is required.';

export const VALIDATE_ID_TOO_LONG = 'IDs must be 100 characters or fewer.';

export default (formValues, allProps) => {
  const errors = {
    student_ids: null,
  };

  /* Required Fields */
  if (!formValues.student_ids || formValues.student_ids.trim().length === 0) {
    errors.student_ids = VALIDATE_STUDENT_ID_REQUIRED;
  }

  if (
    formValues.student_ids &&
    formValues.student_ids
      .trim()
      .split('\n')
      .some(id => id.length > 100)
  ) {
    errors.student_ids = VALIDATE_ID_TOO_LONG;
  }

  return errors;
};
