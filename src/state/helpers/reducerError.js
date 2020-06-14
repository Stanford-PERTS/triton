/**
 * Returns a reducer function for handling errors. If the `action.type` matches
 * `failureRegex` then `action.error` will be returned. If the `action.type`
 * matches either `requestRegex` or `successRegex` then `null` is returned.
 *
 * @param  {Object} initialState the slice's initialState
 * @param  {Regex}  requestRegex request regex to match against action.type
 * @param  {RegExp} successRegex success regex to match against action.type
 * @param  {RegExp} failureRegex failure regex to match against action.type
 * @return {Function}            reducer function
 */

const reducerError = (initialState, requestRegex, successRegex, failureRegex) =>
  function error(state = initialState.error, action) {
    if (action.type.match(requestRegex) || action.type.match(successRegex)) {
      return null;
    }

    if (action.type.match(failureRegex)) {
      return action.error;
    }

    return state;
  };

export default reducerError;
