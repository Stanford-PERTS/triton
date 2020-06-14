import auth from 'services/auth';

let initialUserState;

try {
  // attempt to retrieve user from localStorage
  initialUserState = JSON.parse(localStorage.getItem('triton:auth:user'));
  // add user details to error tracking
  auth.addUserToErrorTracking(initialUserState);
} catch (e) {
  initialUserState = null;
}

export default {
  user: initialUserState || null,
  registrationSuccess: false,
  setPasswordSuccess: false,
  resetPasswordSuccess: false,
  email: null,
  error: null,
  authenticating: false,
};
