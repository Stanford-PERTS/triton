const reducerRedirect = (initialState, redirectRegex) =>
  function redirect(state = initialState.redirect, action) {
    if (action.type.match(redirectRegex) && action.redirect) {
      return action.redirect;
    }

    return null;
  };

export default reducerRedirect;
