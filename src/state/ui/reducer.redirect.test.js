import deepFreeze from 'deep-freeze';

import initialState from './initialState';
import * as types from './actionTypes';
import reducer from './reducer.redirect';

describe('redirect reducer', () => {
  describe('init and irrelevant actions', () => {
    it('should return initial state on init', () => {
      expect(reducer(undefined, {})).toEqual(initialState.redirect);
    });

    it('should return state when no slice action types present', () => {
      const action = { type: 'NON_EXISTANT_ACTION_TYPE' };
      const state = { abc: 123, def: 456 };

      deepFreeze(state);

      expect(reducer(state, action)).toEqual(state);
    });
  });

  describe('REDIRECT_SET', () => {
    it('should set using the path provided', () => {
      const action = {
        type: types.REDIRECT_SET,
        path: '/path/to/redirect/to',
        push: false,
      };
      const state = false;

      deepFreeze(state);

      expect(reducer(state, action)).toEqual({
        path: action.path,
        push: action.push,
      });
    });
  });

  describe('REDIRECT_CLEAR', () => {
    it('should clear any existing path', () => {
      const action = { type: types.REDIRECT_CLEAR };
      const state = '/path/we/redirected/to';

      deepFreeze(state);

      expect(reducer(state, action)).toEqual({ path: false, push: false });
    });
  });
});
