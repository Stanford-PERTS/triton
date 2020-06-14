import * as types from './actionTypes';
import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';

const actionSlice = 'PARTICIPANTS';

export const queryParticipants = () => ({
  type: types.PARTICIPANTS_QUERY_REQUEST,
});

const queryParticipantsByTeamBase = {
  actionSlice,
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_TEAM',
};

export const queryParticipantsByTeam = teamId =>
  addActionTypeToAction({
    ...queryParticipantsByTeamBase,
    actionStage: actionStages.REQUEST,
    teamId,
  });

export const queryParticipantsByTeamSuccess = participants =>
  addActionTypeToAction({
    ...queryParticipantsByTeamBase,
    actionStage: actionStages.SUCCESS,
    payload: participants,
  });

export const queryParticipantsByTeamFailure = error =>
  addActionTypeToAction({
    ...queryParticipantsByTeamBase,
    actionStage: actionStages.ERROR,
    error: String(error),
  });

const queryParticipantsByClassroomBase = {
  actionSlice,
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_CLASSROOM',
};

export const queryParticipantsByClassroom = classroomId =>
  addActionTypeToAction({
    ...queryParticipantsByClassroomBase,
    actionStage: actionStages.REQUEST,
    classroomId,
  });

export const queryParticipantsByClassroomSuccess = participants =>
  addActionTypeToAction({
    ...queryParticipantsByClassroomBase,
    actionStage: actionStages.SUCCESS,
    payload: participants,
  });

export const queryParticipantsByClassroomFailure = error =>
  addActionTypeToAction({
    ...queryParticipantsByClassroomBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
  });

export const getParticipant = participantId => ({
  type: types.PARTICIPANTS_GET_REQUEST,
  participantId,
});

export const addParticipants = participants =>
  addActionTypeToAction({
    actionSlice: 'PARTICIPANTS',
    actionMethod: 'ADD',
    actionStage: 'REQUEST',
    participants,
  });

export const addParticipantsAndRecount = (participants, redirect) => ({
  type: types.HOA_PARTICIPANTS_ADD_REQUEST,
  participants,
  redirect,
});

export const updateParticipant = participant => ({
  type: types.PARTICIPANTS_UPDATE_REQUEST,
  participant,
});

export const removeParticipants = (participants, classroomId) =>
  addActionTypeToAction({
    actionSlice: 'PARTICIPANTS',
    actionMethod: 'REMOVE',
    actionStage: 'REQUEST',
    classroomId,
    participants,
  });

export const removeParticipantsAndRecount = (participants, classroomId) => ({
  type: types.HOA_PARTICIPANTS_REMOVE_REQUEST,
  classroomId,
  participants,
});
