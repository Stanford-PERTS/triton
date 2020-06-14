import keyBy from 'utils/keyBy';

import * as types from './actionTypes';
import initialState from './initialState';

export default (state = initialState, action) => {
  switch (action.type) {
    case types.UNREAD_USER_DIGESTS_REQUEST:
    case types.ALL_USER_DIGESTS_REQUEST:
      return { ...state, error: null, loading: true };
    case types.USER_DIGESTS_SUCCESS:
      // N.B. we're giving preference to the digests already in the state here,
      // which is unusual. The goal is: when viewing your notifications, and
      // some are unread (but have just been marked read on the server), and
      // you click "view all" the effect should be to leave the "unread"
      // elements in place unchanged, and perhaps add some. This is okay
      // because you never do any other type of editing of digests.
      return {
        ...state,
        byId: {
          ...keyBy(action.digests, u => u.uid),
          ...state.byId,
        },
        error: null,
        loading: false,
      };
    case types.USER_DIGESTS_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
      };

    case types.UPDATE_DIGEST_REQUEST:
      return { ...state, updating: true };
    case types.UPDATE_DIGEST_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.digest.uid]: action.digest,
        },
        error: null,
        updating: false,
      };
    case types.UPDATE_DIGEST_FAILURE:
      return { ...state, error: action.error, updating: false };

    default:
      return state;
  }
};
