import createFormSelectors from 'utils/createFormSelectors';
import { formName } from '.';

export default createFormSelectors(formName);

// Named export selectors for our app
export const attachOrganizationFormError = state => state.error;
export const attachOrganizationFormSubmitting = state => state.submitting;
export const attachOrganizationFormSubmittedIds = state =>
  state.submittedOrganizations;
