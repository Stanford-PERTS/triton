const VALIDATE_NAME_REQUIRED = 'Please enter a name.';
const VALIDATE_NAME_TAKEN = 'That name is already in use.';

export default (formValues, props) => {
  const { classroom, classroomNames } = props;

  const errors = {
    name: null,
    contact_id: null,
  };

  const trimmedName = (formValues.name || '').trim();

  /* Required Fields */
  if (trimmedName.length === 0) {
    errors.name = VALIDATE_NAME_REQUIRED;
  }

  if (trimmedName !== classroom.name && classroomNames.includes(trimmedName)) {
    errors.name = VALIDATE_NAME_TAKEN;
  }

  return errors;
};
