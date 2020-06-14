import { createSelector } from 'reselect';

// Can't import this from 'state/selectors', circular reference.
const _usersById = state => state.entities.users.byId;

const _authData = state => state.auth;
const auth = createSelector(
  _authData,
  i => i,
);

// Authenticated user object. From neptune.
// This user object won't have triton information, like owned_teams, so it's
// limited in usefulness. Mainly for other selectors (logged in?, uid, isAdmin?)
// Note: We're not exporting this selector to avoid accidental use.
auth.neptuneUser = createSelector(
  auth,
  state => state.user,
);

// Authenticated user object. From triton.
// This is the user object that will contain triton information.
auth.user = createSelector(
  auth.neptuneUser,
  _usersById,
  (authUser = {}, uById = {}) => authUser && uById[authUser.uid],
);

// TODO REMOVE?
auth.email = createSelector(
  auth,
  state => state.email,
);

// This gets a separate selector because the id is always available, as a part
// of the authenticated session, whereas the `auth.user` selector may require
// async handling if the full user object isn't loaded yet.
auth.user.uid = createSelector(
  auth.neptuneUser,
  (u = {}) => u && u.uid,
);

auth.user.isLoggedIn = createSelector(
  auth.neptuneUser,
  u => Boolean(u),
);
auth.user.isAdmin = createSelector(
  auth.neptuneUser,
  (u = {}) => u && u.user_type === 'super_admin',
);

auth.registrationSuccess = createSelector(
  auth,
  state => state.registrationSuccess,
);

auth.setPasswordSuccess = createSelector(
  auth,
  state => state.setPasswordSuccess,
);

auth.resetPasswordSuccess = createSelector(
  auth,
  state => state.resetPasswordSuccess,
);

// TODO move to `error.auth`
auth.error = createSelector(
  auth,
  state => state.error,
);
// TODO move to global redirect
auth.redirect = createSelector(
  auth,
  state => state.redirect,
);
// TODO probably move to `loading.auth`
auth.authenticating = createSelector(
  auth,
  state => state.authenticating,
);

export default auth;
