export const GENERAL_OUTCOME_REQUIRED = 'Please respond.';
export const OBSERVED_OUTCOMES_REQUIRED = 'Please respond.';
export const PLANNED_MODIFICATIONS_REQUIRED = 'Please respond.';
export const ULTIMATE_GOALS_REQUIRED = 'Please respond.';

export default values => {
  const errors = {};

  /* Required Fields */
  errors.general_outcome = values.general_outcome
    ? null
    : GENERAL_OUTCOME_REQUIRED;
  errors.observed_outcomes = values.observed_outcomes
    ? null
    : OBSERVED_OUTCOMES_REQUIRED;
  errors.planned_modifications = values.planned_modifications
    ? null
    : PLANNED_MODIFICATIONS_REQUIRED;
  errors.ultimate_goals = values.ultimate_goals
    ? null
    : ULTIMATE_GOALS_REQUIRED;

  return errors;
};
