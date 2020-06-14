import * as types from 'state/users/actionTypes';

const userForm = (state = {}, action) => {
  switch (action.type) {
    case types.UPDATE_USER_FAILURE:
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

export default userForm;
