import tritonAuth from 'services/triton/auth';

const login = (email, password) => tritonAuth.login(email, password);

const logout = () => tritonAuth.logout();

const register = email => tritonAuth.register(email);

const setPassword = (token, email) => tritonAuth.setPassword(token, email);

const resetPassword = email => tritonAuth.resetPassword(email);

const checkToken = token => tritonAuth.checkToken(token);

const imitateUser = email => tritonAuth.imitateUser(email);

// Add user data to Sentry error tracking
// https://docs.sentry.io/clients/javascript/#adding-context
// While a user is logged in, you can tell Sentry to associate errors with user
// data. This data is submitted with each error which allows you to figure out
// which users are affected.
const addUserToErrorTracking = user => {
  if (user && window && window.Raven) {
    window.Raven.setUserContext({
      uid: user.uid,
      email: user.email,
    });
  }
};

// Clear user data from Sentry error tracking
// Called when logged out so we're no longer associating errors with user.
const clearUserFromErrorTracking = () => {
  if (window && window.Raven) {
    window.Raven.setUserContext();
  }
};

export default {
  login,
  logout,
  register,
  setPassword,
  resetPassword,
  checkToken,
  imitateUser,
  addUserToErrorTracking,
  clearUserFromErrorTracking,
};
