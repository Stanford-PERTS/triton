import { fullTypeOfAction } from 'state/helpers';

/**
 * Given an `action`, returns the "bare" type version of that action. This is
 * what the `type` would be without the _REQUEST, _SUCCESS, or _FAILURE suffix.
 * This is useful for storing our `meta` keys for loading, errors, lastFetched.
 *
 * Example:
 *   bareTypeOf(query('classrooms'));
 *   // returns 'CLASSROOMS_QUERY'
 *
 * @param  {Object} action a redux action
 * @return {string}        a "bare" redux action type
 */
const bareTypeOf = action => {
  if (!action.actionSlice || !action.actionMethod) {
    // eslint-disable-next-line no-console
    console.warn('bareTypeOf requires actionSlice and actionMethod', action);
    return false;
  }

  return fullTypeOfAction(action).replace(/_REQUEST|_SUCCESS|_FAILURE/, '');
};

export default bareTypeOf;
