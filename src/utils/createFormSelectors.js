import upperFirst from 'lodash/upperFirst';
// https://redux-form.com/6.7.0/docs/api/selectors.md/
import {
  getFormValues,
  getFormInitialValues,
  getFormSyncErrors,
  getFormMeta,
  getFormAsyncErrors,
  getFormSyncWarnings,
  getFormSubmitErrors,
  formValueSelector,
  isDirty,
  isPristine,
  isValid,
  isInvalid,
  isSubmitting,
  hasSubmitSucceeded,
  hasSubmitFailed,
} from 'redux-form';

/**
 * Create selectors for a form from redux-form selectors
 * @param {string} form - name of form created with reduxForm
 * @returns {object} object of selectors for 'form'
 */
const createFormSelectors = form => ({
  [`get${upperFirst(form)}FormValues`]: getFormValues(form),
  [`get${upperFirst(form)}FormInitialValues`]: getFormInitialValues(form),
  [`get${upperFirst(form)}FormSyncErrors`]: getFormSyncErrors(form),
  [`get${upperFirst(form)}FormMeta`]: getFormMeta(form),
  [`get${upperFirst(form)}FormAsyncErrors`]: getFormAsyncErrors(form),
  [`get${upperFirst(form)}FormSyncWarnings`]: getFormSyncWarnings(form),
  [`get${upperFirst(form)}FormSubmitErrors`]: getFormSubmitErrors(form),
  [`get${upperFirst(form)}FormValue`]: formValueSelector(form),
  [`is${upperFirst(form)}FormDirty`]: isDirty(form),
  [`is${upperFirst(form)}FormPristine`]: isPristine(form),
  [`is${upperFirst(form)}FormValid`]: isValid(form),
  [`is${upperFirst(form)}FormInvalid`]: isInvalid(form),
  [`is${upperFirst(form)}FormSubmitting`]: isSubmitting(form),
  [`has${upperFirst(form)}FormSubmitSucceeded`]: hasSubmitSucceeded(form),
  [`has${upperFirst(form)}FormSubmitFailed`]: hasSubmitFailed(form),
});

/**
 * Given a redux-form `formName`, getFormValuesSelectorName will return the
 * name of selector function that returns the form values for `formName`.
 * See scenes/TaskModule/EPPracticeJournal.js for example usage.
 *
 * @param  {string} form a redux-form form name
 * @return {string}      selector function name
 */
export const getFormValuesSelectorNameFor = form =>
  `get${upperFirst(form)}FormValues`;

export default createFormSelectors;
