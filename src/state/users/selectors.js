// https://github.com/reactjs/reselect
//
// All data manipulation is handled by selectors now.
// Using reselect to create our selectors:
//   Selectors can compute derived data, allowing Redux to store the minimal
//    possible state.
//   Selectors are efficient. A selector is not recomputed unless one of its
//    arguments change.
//   Selectors are composable. They can be used as input to other selectors.
// Benefits:
//   No longer need to store manipulated data in the redux state.
//   Simplifies redux state; just need to store one array of data, which
//    is then manipulated and memoized by selectors.
//   Central api for accessing users related data.

import { createSelector } from 'reselect';
import _union from 'lodash/union';
import _values from 'lodash/values';
import keyBy from 'utils/keyBy';

export const usersById = state => state.usersById;
export const inviteesByEmail = state => state.inviteesByEmail;
export const usersMode = state => state.userMode;
export const usersRedirect = state => state.redirect;
export const usersError = state => state.error;
export const usersLoading = state => state.loading;
export const usersInviting = state => state.inviting;
export const usersUpdating = state => state.updating;
export const usersVerifying = state => state.verifying;

export const getUsers = createSelector(
  usersById,
  (uById = {}) => _values(uById),
);
export const getInvitees = createSelector(
  inviteesByEmail,
  (iByEmail = {}) => _values(iByEmail),
);

export const getUsersByTeamId = createSelector(
  getUsers,
  (users = []) => {
    const usersByTeamId = {};
    _union(...users.map(u => u.owned_teams)).forEach(teamId => {
      usersByTeamId[teamId] = users.filter(u => u.owned_teams.includes(teamId));
    });
    return usersByTeamId;
  },
);

export const getUsersByOrganizationId = createSelector(
  getUsers,
  (users = []) => {
    const usersByOrganizationId = {};
    _union(...users.map(u => u.owned_organizations)).forEach(organizationId => {
      usersByOrganizationId[organizationId] = users.filter(u =>
        u.owned_organizations.includes(organizationId),
      );
    });
    return usersByOrganizationId;
  },
);

export const getUserNames = createSelector(
  getUsers,
  (users = []) => users.map(c => c.name),
);
export const getUserIds = createSelector(
  usersById,
  (uById = {}) => Object.keys(uById),
);

export const getUsersByEmail = createSelector(
  getUsers,
  (users = []) => keyBy(users, 'email'),
);
