import * as types from './actionTypes';

export const loginUser = (email, password, redirect) => ({
  type: types.LOGIN_REQUEST,
  email,
  password,
  redirect,
});

export const logoutUser = () => ({ type: types.LOGOUT_REQUEST });

export const register = email => ({ type: types.REGISTER_REQUEST, email });

export const registerReset = () => ({ type: types.REGISTER_RESET });

export const setPassword = (token, password, redirect) => ({
  type: types.PASSWORD_SET_REQUEST,
  token,
  password,
  redirect,
});

export const passwordSetReset = () => ({ type: types.PASSWORD_SET_RESET });

export const resetPassword = email => ({
  type: types.PASSWORD_RESET_REQUEST,
  email,
});

export const passwordResetReset = () => ({ type: types.PASSWORD_RESET_RESET });

export const checkToken = token => ({ type: types.CHECK_TOKEN_REQUEST, token });

export const imitateUser = email => ({
  type: types.IMITATE_USER_REQUEST,
  email,
});
