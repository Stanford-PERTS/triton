import deepFreeze from 'deep-freeze';
import assign from 'lodash/assign';
import omit from 'lodash/omit';

import initialState from './initialState';
import * as types from './actionTypes';
import reducer from './reducer.flash';

describe('ui flash reducer', () => {
  const MOCK_FLASH_KEY = 'INVITE_USER_SUCCESS';
  const MOCK_FLASH_MESSAGE = 'An invitation has been sent.';

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState.flash);
  });

  it('should return state when no slice action types present', () => {
    const action = { type: 'NON_EXISTANT_ACTION_TYPE' };
    const state = { abc: 123, def: 456 };

    deepFreeze(state);

    expect(reducer(state, action)).toEqual(state);
  });

  describe('flash message reducers', () => {
    it('should handle FLASH_SET', () => {
      const action = {
        type: types.FLASH_SET,
        flashKey: MOCK_FLASH_KEY,
        messageKey: MOCK_FLASH_MESSAGE,
      };
      const reducerShouldAdd = {
        [MOCK_FLASH_KEY]: MOCK_FLASH_MESSAGE,
      };

      const stateWithFlashMessage = {};
      assign(stateWithFlashMessage, initialState.flash, reducerShouldAdd);

      deepFreeze(initialState);

      expect(reducer(initialState.flash, action)).toEqual(
        stateWithFlashMessage,
      );
    });

    it('should handle FLASH_DELETE', () => {
      const state = {
        [MOCK_FLASH_KEY]: MOCK_FLASH_MESSAGE,
      };
      const action = {
        type: types.FLASH_DELETE,
        flashKey: MOCK_FLASH_KEY,
      };

      deepFreeze(state);

      const actual = omit(state, `flash.${MOCK_FLASH_KEY}`);

      expect(reducer(state, action)).toEqual(actual);
    });
  });
});
