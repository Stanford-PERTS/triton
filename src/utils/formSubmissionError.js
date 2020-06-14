import { SubmissionError } from 'redux-form';

/**
 * Convenience function to generate form-level errors for redux-form.
 * Note that use of `_code` is a PERTS convention.
 *
 * @param  {string} errorMsg  text to display in UI about error
 * @param  {number} errorCode optional, http response status code, e.g. 409
 * @param  {Object} options   field-level errors, redux-form will set these as
 *     `submitErrors` in the form slice.
 * @return {SubmissionError}  error to put in a failure action
 *
 * @see discussion https://github.com/PERTS/triton/pull/1169#discussion_r273269946
 * @see use of `_error` for form-global errors https://redux-form.com/7.4.2/examples/submitvalidation/
 *
 * @example
 *   import formAction from 'state/form/teamUserInvite/actions';
 *   import formSubmissionError from 'utils/formSubmissionError';
 *
 *   try {
 *     ...
 *   } catch(error) {
 *     const formError = formSubmissionError('Unable to send invite.');
 *     yield put(formAction.failure(formError));
 *   }
 */
export default (errorMsg, errorCode, options) =>
  new SubmissionError({ _error: errorMsg, _code: errorCode, ...options });
