import * as types from './actionTypes';
import initialState from './initialState';

export default (state = initialState.redirect, action) => {
  const { type, path, push } = action;

  switch (type) {
    case types.REDIRECT_SET:
      if (state.path === path) {
        // Don't update state in the case where we're asking to redirect to the
        // same path. Assume Redirector just hasn't redirected yet and the scene
        // or saga that has asked for the redirect is being impatient.
        //
        // Dispatching a state update with an identical path will result in
        // React warning we `Cannot update during an existing state transition`.
        return state;
      }

      return { path, push };

    case types.REDIRECT_CLEAR:
      return { path: false, push: false };

    default:
      return state;
  }
};
