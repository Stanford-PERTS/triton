import * as actions from './actions';
import * as types from './actionTypes';

describe('ui actions', () => {
  describe('flash actions', () => {
    const MOCK_FLASH_KEY = 'INVITE_USER_SUCCESS';
    const MOCK_FLASH_MESSAGE = 'An invitation has been sent.';
    const MOCK_FLASH_TIME = 5000;

    it('should create an action to set a flash message', () => {
      const expectedAction = {
        type: types.FLASH_SET,
        flashKey: MOCK_FLASH_KEY,
        messageKey: MOCK_FLASH_MESSAGE,
        time: MOCK_FLASH_TIME,
      };

      expect(
        actions.flashSet({
          flashKey: MOCK_FLASH_KEY,
          messageKey: MOCK_FLASH_MESSAGE,
          time: MOCK_FLASH_TIME,
        }),
      ).toEqual(expectedAction);
    });

    it('should create an action to delete a flash message', () => {
      const expectedAction = {
        type: types.FLASH_DELETE,
        flashKey: MOCK_FLASH_KEY,
      };

      expect(
        actions.flashDelete({
          flashKey: MOCK_FLASH_KEY,
        }),
      ).toEqual(expectedAction);
    });
  });
});
