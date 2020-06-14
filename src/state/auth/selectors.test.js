import auth from 'state/auth/selectors';
import selectors from 'state/selectors';
import mocks from 'mocks';

import merge from 'lodash/merge';

import store from 'state/store';
const initialState = store.getState();

describe('redux selectors', () => {
  describe('auth', () => {
    it('should have root selector', () => {
      expect(auth).toBeInstanceOf(Function);
    });

    it('should be available on `selectors.auth`', () => {
      expect(selectors.auth).toBe(selectors.auth);
    });

    xit('should have alias of `selectors.authUser`', () => {
      expect(selectors.authUser).toBe(selectors.auth);
    });
  });

  describe('auth.user', () => {
    it('should return authenticated user', () => {
      const user = mocks.createUser();

      const state = merge({}, initialState, {
        auth: { user },
        entities: {
          users: {
            byId: { [user.uid]: user },
          },
        },
      });
      const props = {};

      expect(selectors.auth.user(state, props)).toEqual(state.auth.user);
    });

    it('should return falsy if no user', () => {
      const user = undefined;

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user(state, props)).toBeFalsy();
    });
  });

  describe('auth.email', () => {
    it("should return authenticated user's email", () => {
      const { email } = mocks.createUser();

      const state = merge({}, initialState, { auth: { email } });
      const props = {};

      expect(auth.email(state, props)).toBe(state.auth.email);
    });
  });

  describe('auth.user.uid', () => {
    it("should return authenticated user's uid", () => {
      const user = mocks.createUser();

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user.uid(state, props)).toBe(state.auth.user.uid);
    });

    it('should return falsy if no user', () => {
      const user = undefined;

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user.uid(state, props)).toBeFalsy();
    });
  });

  describe('auth.user.isLoggedIn', () => {
    it('should return true if user is logged in', () => {
      const user = mocks.createUser();

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user.isLoggedIn(state, props)).toBe(true);
    });

    it('should return false if user is NOT logged in', () => {
      const user = undefined;

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user.isLoggedIn(state, props)).toBe(false);
    });
  });

  describe('auth.user.isAdmin', () => {
    it('should return true if authenticated user is super admin', () => {
      const user = mocks.createUser();
      mocks.setUserSuperAdmin(user);

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user.isAdmin(state, props)).toBe(true);
    });

    it('should return false if authenticated user is NOT super admin', () => {
      const user = mocks.createUser();

      const state = merge({}, initialState, { auth: { user } });
      const props = {};

      expect(auth.user.isAdmin(state, props)).toBe(false);
    });
  });

  describe('auth.registrationSuccess', () => {
    it('should return registrationSuccess value', () => {
      const registrationSuccess = 'foo';

      const state = merge({}, initialState, { auth: { registrationSuccess } });
      const props = {};

      expect(auth.registrationSuccess(state, props)).toBe(
        state.auth.registrationSuccess,
      );
    });
  });

  describe('auth.setPasswordSuccess', () => {
    it('should return setPasswordSuccess value', () => {
      const setPasswordSuccess = 'bar';

      const state = merge({}, initialState, { auth: { setPasswordSuccess } });
      const props = {};

      expect(auth.setPasswordSuccess(state, props)).toBe(
        state.auth.setPasswordSuccess,
      );
    });
  });

  describe('auth.resetPasswordSuccess', () => {
    it('should return resetPasswordSuccess value', () => {
      const resetPasswordSuccess = 'baz';

      const state = merge({}, initialState, { auth: { resetPasswordSuccess } });
      const props = {};

      expect(auth.resetPasswordSuccess(state, props)).toBe(
        state.auth.resetPasswordSuccess,
      );
    });
  });

  describe('auth.error', () => {
    it('should return error value', () => {
      const error = 'Unauthorized';

      const state = merge({}, initialState, { auth: { error } });
      const props = {};

      expect(auth.error(state, props)).toBe(state.auth.error);
    });
  });

  describe('auth.redirect', () => {
    it('should return redirect value', () => {
      const redirect = '/home';

      const state = merge({}, initialState, { auth: { redirect } });
      const props = {};

      expect(auth.redirect(state, props)).toBe(state.auth.redirect);
    });
  });

  describe('auth.authenticating', () => {
    it('should return authenticating value', () => {
      const authenticating = false;

      const state = merge({}, initialState, { auth: { authenticating } });
      const props = {};

      expect(auth.authenticating(state, props)).toBe(state.auth.authenticating);
    });
  });
});
