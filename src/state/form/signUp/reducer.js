import { REGISTER_FAILURE } from 'state/auth/actionTypes';

const signUpForm = (state = {}, action) => {
  const isEmailError =
    action.error &&
    typeof action.error.code === 'string' &&
    (action.error.code.includes('user') || action.error.code.includes('email'));

  switch (action.type) {
    case REGISTER_FAILURE:
      if (isEmailError) {
        return {
          ...state,
          syncErrors: {
            ...state.syncErrors,
            email: action.error.message,
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

export default signUpForm;
