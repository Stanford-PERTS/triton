import deepFreeze from 'deep-freeze';
import initialState from './initialState';
import selectors from 'state/selectors';

describe('ui selectors', () => {
  describe('flash selectors', () => {
    const MOCK_FLASH_KEY = 'INVITE_USER_SUCCESS';

    const state = {
      ui: {
        someOtherProp1: {},
        someOtherProp2: {},
        flash: {
          [MOCK_FLASH_KEY]: 'An invitation has been sent',
        },
      },
    };

    const props = {
      someOtherProp1: {},
      someOtherProp2: 'Entity_123456789',
      flashKey: MOCK_FLASH_KEY,
    };

    describe('flashMessage', () => {
      it('should return the flash message from state', () => {
        deepFreeze(state);

        const expected = selectors.flashMessage(state, props);
        const actual = state.ui.flash[MOCK_FLASH_KEY];

        expect(expected).toEqual(actual);
      });

      it('should return null if the flash message does not exist', () => {
        const stateWithNoFlash = {
          ...state,
          ui: {
            ...state.ui,
            flash: {
              // no flash messages
            },
          },
        };

        deepFreeze(stateWithNoFlash);

        const expected = selectors.flashMessage(stateWithNoFlash, props);
        const actual = null;

        expect(expected).toEqual(actual);
      });
    });
  });

  describe('redirect selectors', () => {
    it('should return a path if there is one', () => {
      const state = {
        ui: {
          ...initialState,
          redirect: '/path/to/redirect/to',
        },
      };
      const props = {};

      deepFreeze(state);

      expect(selectors.redirect(state, props)).toEqual(state.ui.redirect);
    });

    it('should return false if there is not one', () => {
      const state = {
        ui: {
          ...initialState,
          redirect: false,
        },
      };
      const props = {};

      deepFreeze(state);

      expect(selectors.redirect(state, props)).toEqual(false);
    });
  });
});
