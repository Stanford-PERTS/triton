import { LOGIN_FAILURE } from 'state/auth/actionTypes';

const loginForm = (state = {}, action) => {
  const isEmailError =
    action.error &&
    typeof action.error.code === 'string' &&
    (action.error.code.includes('user') || action.error.code.includes('email'));

  const isPasswordError =
    action.error &&
    typeof action.error.code === 'string' &&
    action.error.code.includes('password');
  switch (action.type) {
    case LOGIN_FAILURE:
      if (isEmailError) {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            email: action.error.message,
          },
        };
      } else if (isPasswordError) {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            password: action.error.message,
          },
        };
      }
      return {
        ...state,
        syncErrors: {
          ...state.syncErrors,
          _form: action.error.message,
        },
      };

    default:
      return state;
  }
};

export default loginForm;
