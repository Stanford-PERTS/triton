import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction, makeAction } from 'state/helpers';
import * as types from './actionTypes';

const actionSlice = 'CLASSROOMS';

const queryClassroomsWithParticipationBase = {
  actionPrefix: 'HOA',
  actionSlice,
  actionMethod: actionMethods.QUERY,
  actionName: 'WITH_PARTICIPATION',
  actionOptions: 'BY_TEAM',
};

export const queryClassroomsWithParticipation = teamId =>
  makeAction({
    ...queryClassroomsWithParticipationBase,
    actionStage: actionStages.REQUEST,
    teamId,
  });

export const queryClassroomsWithParticipationSuccess = (
  classrooms,
  teamId,
  participation,
) =>
  makeAction({
    ...queryClassroomsWithParticipationBase,
    actionStage: actionStages.SUCCESS,
    classrooms,
    teamId,
    participation,
  });

export const queryClassroomsWithParticipationFailure = (error, teamId) =>
  makeAction({
    ...queryClassroomsWithParticipationBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
  });

const queryClassroomsByTeamBase = {
  actionSlice,
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_TEAM',
};

export const queryClassroomsByTeam = teamId =>
  addActionTypeToAction({
    ...queryClassroomsByTeamBase,
    actionStage: actionStages.REQUEST,
    teamId,
  });

export const queryClassroomsByTeamSuccess = (classrooms, teamId) =>
  addActionTypeToAction({
    ...queryClassroomsByTeamBase,
    actionStage: actionStages.SUCCESS,
    teamId,
    classrooms,
    payload: classrooms,
  });

export const queryClassroomsByTeamFailure = (error, teamId) =>
  addActionTypeToAction({
    ...queryClassroomsByTeamBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
    teamId,
  });

export const getClassroom = classroomId => ({
  actionSlice,
  actionMethod: actionMethods.GET,
  actionStage: actionStages.REQUEST,
  actionUids: [classroomId],
  type: types.CLASSROOM_GET_REQUEST,
  classroomId,
});

export const getClassroomSuccess = classroom => ({
  actionSlice,
  actionMethod: actionMethods.GET,
  actionStage: actionStages.SUCCESS,
  actionUids: [classroom ? classroom.uid : undefined],
  type: types.CLASSROOM_GET_SUCCESS,
  classroom,
});

export const getClassroomFailure = (error, uid, redirect) => ({
  actionSlice,
  actionMethod: actionMethods.GET,
  actionStage: actionStages.FAILURE,
  actionUids: [uid],
  type: types.CLASSROOM_GET_FAILURE,
  error: String(error),
  redirect,
});

/**
 * Always triggers:
 * CLASSROOM_GET_REQUEST
 * TEAM_ONLY_REQUEST
 * USERS_BY_TEAM_REQUEST
 * CLASSROOM_PARTICIPATION_REQUEST
 *
 * Conditionally triggers:
 * TEAMS_BY_ORGANIZATION_REQUEST
 * @param {string} classroomId from route
 * @param {string} teamId from route
 * @returns {Object} action
 */
export const getClassroomDetail = (classroomId, teamId) => ({
  ...getClassroom(classroomId),
  type: types.CLASSROOM_DETAIL_REQUEST,
  teamId,
});

export const getClassroomDetailSuccess = (
  classroom,
  participation,
  completionByClassroomId,
  users,
  userTeams,
  organizationTeams,
) => ({
  ...getClassroomSuccess(classroom),
  type: types.CLASSROOM_DETAIL_SUCCESS,
  participation,
  completionByClassroomId,
  users,
  userTeams,
  organizationTeams,
});

export const getClassroomDetailFailure = (error, uid) => ({
  ...getClassroomFailure(error, uid),
  type: types.CLASSROOM_DETAIL_FAILURE,
});

export const addClassroom = (classroomParams, teamsClassroomsPath) => ({
  actionSlice,
  actionMethod: actionMethods.ADD,
  actionStage: actionStages.REQUEST,
  type: types.CLASSROOM_ADD_REQUEST,
  classroomParams,
  teamsClassroomsPath,
});

export const addClassroomSuccess = (classroom, redirect) => ({
  actionSlice,
  actionMethod: actionMethods.ADD,
  actionStage: actionStages.SUCCESS,
  type: types.CLASSROOM_ADD_SUCCESS,
  classroom,
  redirect,
});

export const addClassroomFailure = (error, redirect) => ({
  actionSlice,
  actionMethod: actionMethods.ADD,
  actionStage: actionStages.FAILURE,
  type: types.CLASSROOM_ADD_FAILURE,
  error: String(error),
  redirect,
});

export const updateClassroom = classroom => ({
  actionSlice,
  actionMethod: actionMethods.UPDATE,
  actionStage: actionStages.REQUEST,
  actionUids: [classroom.uid],
  type: types.CLASSROOM_UPDATE_REQUEST,
  classroom,
});

export const updateClassroomSuccess = (classroom = {}, redirect) => ({
  actionSlice,
  actionMethod: actionMethods.UPDATE,
  actionStage: actionStages.SUCCESS,
  actionUids: [classroom.uid],
  type: types.CLASSROOM_UPDATE_SUCCESS,
  // TODO update to single classroom, update reducer
  classrooms: [classroom],
  redirect,
});

export const updateClassroomFailure = (error, uid, redirect) => ({
  actionSlice,
  actionMethod: actionMethods.UPDATE,
  actionStage: actionStages.FAILURE,
  actionUids: [uid],
  type: types.CLASSROOM_UPDATE_FAILURE,
  error: String(error),
  redirect,
});

/**
 * DELETE a classroom.
 * @param {Object} classroom to be deleted
 * @param {string} teamId for navigation after deletion
 * @param {string} redirect optional, for navigation after deletion
 * @returns {object} action
 */
export const removeClassroom = (classroom, teamId, redirect) => ({
  type: types.CLASSROOM_REMOVE_REQUEST,
  classroom,
  teamId,
  redirect,
});

export const setClassroomMode = mode => ({
  type: types.CLASSROOM_MODE_SET,
  mode,
});

export const resetClassroomMode = () => ({ type: types.CLASSROOM_MODE_RESET });
