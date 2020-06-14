import * as types from './actionTypes';

export const flashSet = ({ flashKey, messageKey, time }) => ({
  type: types.FLASH_SET,
  flashKey,
  messageKey,
  // optional, time in milliseconds to display message (default is 10 * 1000)
  time,
});

export const flashDelete = ({ flashKey }) => ({
  type: types.FLASH_DELETE,
  flashKey,
});

export const redirectTo = (path, push = false) => ({
  type: types.REDIRECT_SET,
  // The route to redirect to.
  path,
  // When true, redirecting will push a new entry onto the history instead of
  // replacing the current one.
  // https://reacttraining.com/react-router/web/api/Redirect/push-bool
  push,
});

export const redirectClear = () => ({
  type: types.REDIRECT_CLEAR,
});
