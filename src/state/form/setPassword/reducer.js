import {
  CHECK_TOKEN_FAILURE,
  PASSWORD_SET_FAILURE,
} from '../../auth/actionTypes';

export const MESSAGE_INVITATION_INVALID = 'Your invitation is no longer valid.';
export const MESSAGE_INVITATION_USED = 'Your invitation has been used.';
export const MESSAGE_INVITATION_EXPIRED = 'Your invitation has expired.';

const setPasswordForm = (state = {}, action) => {
  switch (action.type) {
    case CHECK_TOKEN_FAILURE:
    case PASSWORD_SET_FAILURE:
      // used tokens (server includes time used, so just check for 'used')
      if (action.error.code === 410 && action.error.message.includes('used')) {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            _form: MESSAGE_INVITATION_USED,
          },
        };
      }

      // expired tokens
      if (action.error.code === 410 && action.error.message === 'expired') {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            _form: MESSAGE_INVITATION_EXPIRED,
          },
        };
      }

      // in cases where the user submits the form after the token is no longer
      // valid, perhaps the page was valid when loaded, but expired between
      // that time and when they click submit
      if (action.error.code === 401) {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            _form: MESSAGE_INVITATION_INVALID,
          },
        };
      }

      // other non 410 errors:
      // just display the error that comes back from server
      if (action.error.code !== 410) {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            _form: action.error.message,
          },
        };
      }

      return state;

    default:
      return state;
  }
};

export default setPasswordForm;
