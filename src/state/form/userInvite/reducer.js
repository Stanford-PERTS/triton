import * as types from 'state/users/actionTypes';

const userInviteForm = (state = {}, action) => {
  switch (action.type) {
    case types.CHECK_USER_EXISTS_SUCCESS:
      return {
        ...state,
        values: {
          ...state.values,
          ...action.user,
          existingUser: true,
        },
      };

    case types.CHECK_USER_EXISTS_FAILURE:
      return {
        ...state,
        values: {
          ...state.values,
          existingUser: false,
          // Also clear UID since it's used to check if this user already exists
          // on the team, and it's possible that the UID was filled out from a
          // previous _SUCCESS user lookup action.
          uid: null,
        },
      };

    default:
      return state;
  }
};

export default userInviteForm;
