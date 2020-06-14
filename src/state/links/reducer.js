import initialState from './initialState';
import { SAVE_QUERY_LINKS } from './actionTypes';

export default (state = initialState, action) => {
  switch (action.type) {
    case SAVE_QUERY_LINKS:
      return {
        ...state,
        [action.sliceName.toLowerCase()]: action.links,
      };

    default:
      return state;
  }
};
