/**
 * Returns a reducer function for handling loading. If the `action.type` matches
 * `requestRegex` then `true` will be returned. If the `action.type`
 * matches either `successRegex` or `failureRegex` then `false` is returned.
 *
 * @param  {Object} initialState the slice's initialState
 * @param  {Regex}  requestRegex request regex to match against action.type
 * @param  {RegExp} successRegex success regex to match against action.type
 * @param  {RegExp} failureRegex failure regex to match against action.type
 * @return {Function}            reducer function
 */

const reducerLoading = (
  initialState,
  requestRegex,
  successRegex,
  failureRegex,
) =>
  function loading(state = initialState.loading, action) {
    if (action.type.match(requestRegex)) {
      return true;
    }

    if (action.type.match(successRegex) || action.type.match(failureRegex)) {
      return false;
    }

    return state;
  };

export default reducerLoading;
