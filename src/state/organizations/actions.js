import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';
import * as types from './actionTypes';

const actionSlice = 'ORGANIZATIONS';

export const queryOrganizations = queryOptions => ({
  actionSlice: 'ORGANIZATIONS',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.REQUEST,
  type: types.ORGANIZATIONS_REQUEST,
  queryOptions,
});

export const queryOrganizationsSuccess = (organizations = {}, links = '') => ({
  actionSlice: 'ORGANIZATIONS',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.SUCCESS,
  type: types.ORGANIZATIONS_SUCCESS,
  organizations,
  links,
});

export const queryOrganizationsFailure = error => ({
  actionSlice: 'ORGANIZATIONS',
  actionMethod: actionMethods.QUERY,
  actionStage: actionStages.FAILURE,
  type: types.ORGANIZATIONS_FAILURE,
  error: String(error),
});

export const getOrganization = organizationId => ({
  actionSlice: 'ORGANIZATIONS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.REQUEST,
  actionUids: [organizationId],
  type: types.ORGANIZATION_REQUEST,
  organizationId,
});

export const getOrganizationSuccess = organization => ({
  actionSlice: 'ORGANIZATIONS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.SUCCESS,
  actionUids: [organization.uid],
  type: types.ORGANIZATION_SUCCESS,
  organization,
});

export const getOrganizationFailure = (error, organizationId, redirect) => ({
  actionSlice: 'ORGANIZATIONS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.FAILURE,
  actionUids: [organizationId],
  type: types.ORGANIZATION_FAILURE,
  error: String(error),
  redirect,
});

export const queryOrganizationDashboard = organizationId =>
  addActionTypeToAction({
    actionPrefix: 'HOA_DASHBOARD',
    actionSlice,
    actionMethod: actionMethods.QUERY,
    actionStage: actionStages.REQUEST,
    organizationId,
  });

export const queryOrganizationDashboardSuccess = organizationId =>
  addActionTypeToAction({
    actionPrefix: 'HOA_DASHBOARD',
    actionSlice,
    actionMethod: actionMethods.QUERY,
    actionStage: actionStages.SUCCESS,
    organizationId,
  });

export const queryOrganizationDashboardFailure = organizationId =>
  addActionTypeToAction({
    actionPrefix: 'HOA_DASHBOARD',
    actionSlice,
    actionMethod: actionMethods.QUERY,
    actionStage: actionStages.FAILURE,
    organizationId,
  });

/**
 * Triggers:
 * ORGANIZATION_REQUEST
 * QUERY_PROGRAMS_REQUEST
 * UPDATE_USER_REQUEST
 * @param {string} organizationId from route
 * @returns {Object} action
 */
export const getOrganizationHome = organizationId => ({
  type: types.ORGANIZATION_HOME_REQUEST,
  organizationId,
});

export const queryOrganizationsByTeam = teamId => ({
  type: types.ORGANIZATIONS_BY_TEAM_REQUEST,
  teamId,
});

export const addOrganization = organization => ({
  type: types.ORGANIZATION_ADD_REQUEST,
  organization,
});

export const updateOrganization = organization => ({
  type: types.ORGANIZATION_UPDATE_REQUEST,
  organization,
});

export const setOrganizationMode = mode => ({
  type: types.ORGANIZATION_MODE_SET,
  mode,
});

export const resetOrganizationMode = () => ({
  type: types.ORGANIZATION_MODE_RESET,
});

export const changeOrganizationCode = organizationId => ({
  type: types.ORGANIZATION_CODE_REQUEST,
  organizationId,
});

export const removeOrganization = organizationId => ({
  type: types.ORGANIZATION_REMOVE_REQUEST,
  organizationId,
});
