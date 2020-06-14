import { actionMethods, actionStages } from 'state/actionTypes';
import * as types from './actionTypes';

export const queryUsersByTeam = teamId => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.QUERY,
  actionOptions: 'BY_TEAM',
  actionStage: actionStages.REQUEST,
  type: types.USERS_BY_TEAM_REQUEST,
  teamId,
});

export const queryUsersByOrganization = organizationId => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.QUERY,
  actionOptions: 'BY_ORGANIZATION',
  actionStage: actionStages.REQUEST,
  type: types.USERS_BY_ORGANIZATION_REQUEST,
  organizationId,
});

export const queryUsersByOrganizationSuccess = (users, organizationId) => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.QUERY,
  actionOptions: 'BY_ORGANIZATION',
  actionStage: actionStages.SUCCESS,
  type: types.USERS_BY_ORGANIZATION_SUCCESS,
  organizationId,
  users,
});

export const queryUsersByOrganizationFailure = (error, organizationId) => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.QUERY,
  actionOptions: 'BY_ORGANIZATION',
  actionStage: actionStages.FAILURE,
  type: types.USERS_BY_ORGANIZATION_FAILURE,
  organizationId,
  error: String(error),
});

export const getUser = uid => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.REQUEST,
  actionUids: [uid],
  type: types.USER_REQUEST,
  uid,
});

export const getUserSuccess = (user = {}) => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.SUCCESS,
  actionUids: [user.uid],
  type: types.USER_SUCCESS,
  user,
});

export const getUserFailure = (error, uid) => ({
  actionSlice: 'USERS',
  actionMethod: actionMethods.GET,
  actionStage: actionStages.FAILURE,
  actionUids: [uid],
  type: types.USER_FAILURE,
  error: String(error),
});

export const getUserByTeam = (teamId, userId) => ({
  type: types.USER_REQUEST,
  teamId,
  uid: userId,
});

export const getUserByEmail = email => ({ type: types.USER_REQUEST, email });

export const inviteUsers = (invitees, inviter, team) => ({
  type: types.INVITE_USERS_REQUEST,
  invitees,
  inviter,
  team,
});

export const inviteOrganizationUser = (invitee, inviter, organization) => ({
  type: types.INVITE_ORGANIZATION_USER_REQUEST,
  invitee,
  inviter,
  organization,
});

export const stageInvitee = invitee => ({ type: types.STAGE_INVITEE, invitee });

export const unstageInvitee = email => ({ type: types.UNSTAGE_INVITEE, email });

export const unstageInvitees = () => ({ type: types.UNSTAGE_INVITEES });

export const updateUser = (user, redirect) => ({
  type: types.UPDATE_USER_REQUEST,
  user,
  redirect,
});

export const updateUsers = users => ({
  type: types.UPDATE_USERS_REQUEST,
  users,
});

export const setUserMode = mode => ({ type: types.USER_MODE_SET, mode });

export const resetUserMode = () => ({ type: types.USER_MODE_RESET });

export const checkUserExists = email => ({
  type: types.CHECK_USER_EXISTS_REQUEST,
  email,
});

export const verifyUsers = users => ({
  type: types.VERIFY_USERS_REQUEST,
  users,
});
