export const VALIDATE_TEAM_NAME_REQUIRED = 'Team name required.';
export const VALIDATE_TARGET_GROUP_NAME_NON_EMPTY =
  'Please name your target group.';

export default values => {
  const errors = {};

  errors.name = values.name ? null : VALIDATE_TEAM_NAME_REQUIRED;

  // If users deactive the target group feature, this will be set to null, and
  // that's fine. If they reactivate it, it will be an empty string, and we
  // remind them to give it a name.
  errors.target_group_name =
    values.target_group_name !== ''
      ? null
      : VALIDATE_TARGET_GROUP_NAME_NON_EMPTY;

  return errors;
};
