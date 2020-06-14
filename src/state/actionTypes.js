export * from './api/actionTypes';
export * from './auth/actionTypes';
export * from './classrooms/actionTypes';
export * from './digests/actionTypes';
export * from './metrics/actionTypes';
export * from './reports/actionTypes';
export * from './shared/actionTypes';
export * from './surveys/actionTypes';
export * from './teams/actionTypes';
export * from './uploads/actionTypes';
export * from './users/actionTypes';

export const CLEAR_FLAGS = 'CLEAR_FLAGS';

export const actionMethods = {
  QUERY: 'QUERY',
  ADD: 'ADD',
  GET: 'GET',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
};

export const sliceActionTypesList = [actionMethods.QUERY, actionMethods.ADD];

export const hoaActionTypesList = [actionMethods.QUERY, actionMethods.ADD];

export const entityActionTypesList = [
  actionMethods.GET,
  actionMethods.UPDATE,
  actionMethods.REMOVE,
];

export const actionMethodsFlags = {
  QUERY: 'LOADING',
  ADD: 'ADDDING',
  GET: 'LOADING',
  UPDATE: 'UPDATING',
  REMOVE: 'REMOVING',
};

export const actionStages = {
  REQUEST: 'REQUEST',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

export const byEntityLookup = {
  BY_CLASSROOM: 'classroomId',
  BY_CYCLE: 'cycleId',
  BY_ORGANIZATION: 'organizationId',
  BY_TEAM: 'teamId',
  BY_USER: 'userId',
};
