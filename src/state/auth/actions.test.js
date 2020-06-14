import * as actions from './actions';
import * as types from './actionTypes';

describe('auth actions', () => {
  it('should create an action to request a login', () => {
    const email = 'foo@perts.net';
    const password = '1231231231';
    const expectedAction = {
      type: types.LOGIN_REQUEST,
      email,
      password,
    };
    expect(actions.loginUser(email, password)).toEqual(expectedAction);
  });

  it('should create an action to request a logout', () => {
    const expectedAction = {
      type: types.LOGOUT_REQUEST,
    };
    expect(actions.logoutUser()).toEqual(expectedAction);
  });

  it('should create an action to request registration', () => {
    const email = 'email@example.com';
    const expectedAction = {
      type: types.REGISTER_REQUEST,
      email,
    };
    expect(actions.register(email)).toEqual(expectedAction);
  });

  it('should create an action to reset registration state', () => {
    const expectedAction = {
      type: types.REGISTER_RESET,
    };
    expect(actions.registerReset()).toEqual(expectedAction);
  });

  it('should create an action to request setting password', () => {
    const token = '!!@@jwt.TokenCha.racterS.tring@@!!';
    const password = 'n3wP@ssw0rd';
    const expectedAction = {
      type: types.PASSWORD_SET_REQUEST,
      token,
      password,
    };
    expect(actions.setPassword(token, password)).toEqual(expectedAction);
  });

  it('should create an action to reset password set state', () => {
    const expectedAction = {
      type: types.PASSWORD_SET_RESET,
    };
    expect(actions.passwordSetReset()).toEqual(expectedAction);
  });

  it('should create an action to request a password reset', () => {
    const email = 'email@example.com';
    const expectedAction = {
      type: types.PASSWORD_RESET_REQUEST,
      email,
    };
    expect(actions.resetPassword(email)).toEqual(expectedAction);
  });

  it('should create an action to reset password reset state', () => {
    const expectedAction = {
      type: types.PASSWORD_RESET_RESET,
    };
    expect(actions.passwordResetReset()).toEqual(expectedAction);
  });

  it('should create an action to check JWT token', () => {
    const token = 'QWERTY123456';
    const expectedAction = {
      type: types.CHECK_TOKEN_REQUEST,
      token,
    };
    expect(actions.checkToken(token)).toEqual(expectedAction);
  });

  it('should create an action to initiate imitating a user', () => {
    const email = 'email@example.com';
    const expectedAction = {
      type: types.IMITATE_USER_REQUEST,
      email,
    };
    expect(actions.imitateUser(email)).toEqual(expectedAction);
  });
});
