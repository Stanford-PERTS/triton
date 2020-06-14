import createFormSelectors from 'utils/createFormSelectors';

// Default export the selectors from redux form
export default createFormSelectors('organization');

// Named export selectors for our app
export const organizationFormError = state => state.error;
export const organizationFormRedirect = state => state.redirect;
export const organizationFormSubmitting = state => state.submitting;
