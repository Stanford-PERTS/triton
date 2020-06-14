import * as types from './actionTypes';
import initialState from './initialState';
import omit from 'lodash/omit';

export default (state = initialState.flash, action) => {
  switch (action.type) {
    case types.FLASH_SET:
      return {
        ...state,
        [action.flashKey]: action.messageKey,
      };

    case types.FLASH_DELETE:
      return {
        ...state,
        ...omit(state.flash, action.flashKey),
      };

    default:
      return state;
  }
};
