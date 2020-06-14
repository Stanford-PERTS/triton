const reducerUpdating = (
  initialState,
  requestRegex,
  successRegex,
  failureRegex,
) =>
  function updating(state = initialState.updating, action) {
    if (action.type.match(requestRegex)) {
      return true;
    }

    if (action.type.match(successRegex) || action.type.match(failureRegex)) {
      return false;
    }

    return state;
  };

export default reducerUpdating;
