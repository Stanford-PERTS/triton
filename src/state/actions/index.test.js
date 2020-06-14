import * as actions from 'state/actions';
import * as types from 'state/actionTypes';

describe('redux actions', () => {
  describe('clearFlags', () => {
    it('should create an action to clear flags', () => {
      const expectedAction = {
        type: types.CLEAR_FLAGS,
      };
      expect(actions.clearFlags()).toEqual(expectedAction);
    });
  });
});
