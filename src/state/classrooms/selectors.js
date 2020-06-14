// https://github.com/reactjs/reselect
// All data manipulation is handled by selectors now.
// Using reselect to create our selectors:
// - Selectors can compute derived data, allowing Redux to store the minimal
//   possible state.
// - Selectors are efficient. A selector is not recomputed unless one of its
//   arguments change.
// - Selectors are composable. They can be used as input to other selectors.
// Benefits:
// - No longer need to store manipulated data in the redux state.
// - Simplifies redux state; just need to store one array of data, which is then
//   manipulated and memoized by selectors.
// - Central api for accessing classrooms related data.

import { createSelector } from 'reselect';
import _values from 'lodash/values';
import groupBy from 'utils/groupBy';

export const classroomsById = state => state.byId;
export const classroomsMode = state => state.classroomMode;
export const classroomsRedirect = state => state.redirect;
export const classroomsLoading = state => state.loading;
export const classroomsAdding = state => state.adding;
export const classroomsDeleting = state => state.deleting;
export const classroomsUpdating = state => state.updating;
export const classroomsError = state => state.error;
export const participationByClassroomId = state =>
  state.participationByClassroom;

export const getClassrooms = createSelector(
  classroomsById,
  (cRoomsById = {}) => _values(cRoomsById),
);

export const getClassroomNames = createSelector(
  getClassrooms,
  (classrooms = []) => classrooms.map(c => c.name),
);

export const getClassroomContacts = createSelector(
  getClassrooms,
  (classrooms = []) => classrooms.map(c => c.contact_id),
);
export const getClassroomIds = createSelector(
  classroomsById,
  (cRoomsById = {}) => Object.keys(cRoomsById),
);

export const getClassroomsByTeamId = createSelector(
  getClassrooms,
  (classrooms = []) => groupBy(classrooms, 'team_id'),
);
export const getClassroomsByContactId = createSelector(
  getClassrooms,
  (classrooms = []) => groupBy(classrooms, 'contact_id'),
);
