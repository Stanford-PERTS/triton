import * as types from './actionTypes';
import moment from 'moment';
import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction, makeAction } from 'state/helpers';

import { serverDateFormat } from 'config';

const actionSlice = 'CYCLES';

// Handle conversion from moment dates to string format that server expects
// here so that we don't have to do it in scene handlers.
const convertDate = d => (d ? moment(d).format(serverDateFormat) : null);
const convertDatetime = dt =>
  dt
    ? moment(dt)
        .clone()
        .utc()
        .format()
    : null;
const convertCycleDatesToServer = cycle => ({
  ...cycle,
  start_date: convertDate(cycle.start_date),
  end_date: convertDate(cycle.end_date),
  extended_end_date: convertDate(cycle.extended_end_date),
  meeting_datetime: convertDatetime(cycle.meeting_datetime),
  resolution_date: convertDate(cycle.resolution_date),
});

export const queryCyclesByTeam = teamId => ({
  type: types.CYCLES_BY_TEAM_REQUEST,
  teamId,
});

const queryCyclesCurrentByTeamBase = {
  actionSlice,
  actionMethod: actionMethods.QUERY,
  actionName: 'CURRENT',
  actionOptions: 'BY_TEAM',
};

export const queryCyclesCurrentByTeam = teamId =>
  makeAction({
    ...queryCyclesCurrentByTeamBase,
    actionStage: actionStages.REQUEST,
    teamId,
  });

export const queryCyclesCurrentByTeamSuccess = cycle =>
  makeAction({
    ...queryCyclesCurrentByTeamBase,
    actionStage: actionStages.SUCCESS,
    cycle,
    payload: cycle,
  });

export const queryCyclesCurrentByTeamFailure = (error, teamId) =>
  makeAction({
    ...queryCyclesCurrentByTeamBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
    teamId,
  });

export const getCycle = cycleId => ({
  type: types.CYCLES_GET_REQUEST,
  cycleId,
});

export const addCycle = cycle => ({
  type: types.CYCLE_ADD_REQUEST,
  cycle: convertCycleDatesToServer(cycle),
});

export const updateCycle = cycle => ({
  actionSlice: 'CYCLES',
  actionMethod: actionMethods.UPDATE,
  actionStage: actionStages.REQUEST,
  actionUids: [cycle.uid],
  type: types.CYCLE_UPDATE_REQUEST,
  cycle: convertCycleDatesToServer(cycle),
});

export const updateCycleSuccess = cycle => ({
  actionSlice: 'CYCLES',
  actionMethod: actionMethods.UPDATE,
  actionStage: actionStages.SUCCESS,
  actionUids: [cycle.uid],
  type: types.CYCLE_UPDATE_SUCCESS,
  cycle,
});

export const updateCycleFailure = (error, cycle) => ({
  actionSlice: 'CYCLES',
  actionMethod: actionMethods.UPDATE,
  actionStage: actionStages.FAILURE,
  actionUids: [cycle.uid],
  type: types.CYCLE_UPDATE_FAILURE,
  error: String(error),
});

export const removeCycle = cycle => ({
  type: types.CYCLE_REMOVE_REQUEST,
  cycle,
});

const queryParticipationByTeamBase = {
  actionSlice: 'CYCLE',
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_TEAM',
};

export const queryParticipationByTeam = (cycle, classrooms) => ({
  ...queryParticipationByTeamBase,
  actionStage: actionStages.REQUEST,
  type: types.CYCLE_QUERY_PARTICIPATION_BY_TEAM_REQUEST,
  cycle,
  classrooms,
});

export const queryParticipationByTeamSuccess = (
  cycleId,
  participationByClassroomId,
) => ({
  ...queryParticipationByTeamBase,
  actionStage: actionStages.SUCCESS,
  type: types.CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS,
  cycleId,
  participationByClassroomId,
  payload: participationByClassroomId,
});

export const queryParticipationByTeamFailure = error => ({
  ...queryParticipationByTeamBase,
  actionStage: actionStages.FAILURE,
  type: types.CYCLE_QUERY_PARTICIPATION_BY_TEAM_FAILURE,
  error: String(error),
});

export const queryParticipationByUser = (cycle, classrooms) => ({
  type: types.CYCLES_PARTICIPATION_BY_USER_REQUEST,
  cycle,
  classrooms,
});

const queryCompletionByTeamBase = {
  actionPrefix: 'HOA_COMPLETION_TEAM',
  actionSlice: 'CYCLE',
  actionMethod: actionMethods.QUERY,
};

export const queryCompletionByTeam = (teamId, cycleId) =>
  addActionTypeToAction({
    ...queryCompletionByTeamBase,
    actionStage: actionStages.REQUEST,
    teamId,
    cycleId,
  });

export const queryCompletionByTeamSuccess = cycleId =>
  addActionTypeToAction({
    ...queryCompletionByTeamBase,
    actionStage: actionStages.SUCCESS,
    cycleId,
  });

export const queryCompletionByTeamFailure = error =>
  addActionTypeToAction({
    ...queryCompletionByTeamBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
  });

const queryCompletionByUserBase = {
  actionPrefix: 'HOA_COMPLETION_USER',
  actionSlice: 'CYCLE',
  actionMethod: actionMethods.QUERY,
};

export const queryCompletionByUser = cycleId =>
  addActionTypeToAction({
    ...queryCompletionByUserBase,
    actionStage: actionStages.REQUEST,
    cycleId,
  });

export const queryCompletionByUserSuccess = (
  cycleId,
  completionByClassroomId,
) =>
  addActionTypeToAction({
    ...queryCompletionByUserBase,
    actionStage: actionStages.SUCCESS,
    cycleId,
    payload: completionByClassroomId,
  });

export const queryCompletionByUserFailure = error =>
  addActionTypeToAction({
    ...queryCompletionByUserBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
  });

const queryCompletionByClassroomBase = {
  actionSlice: 'CYCLE',
  actionMethod: actionMethods.QUERY,
  actionByEntity: 'BY_CLASSROOM',
};

export const queryCompletionByClassroom = (cycle, classroom) => ({
  ...queryCompletionByClassroomBase,
  actionStage: actionStages.REQUEST,
  type: types.CYCLE_QUERY_COMPLETION_BY_CLASSROOM_REQUEST,
  cycle,
  classroom,
});

export const queryCompletionByClassroomSuccess = (
  cycleId,
  completionByClassroomId,
) => ({
  ...queryCompletionByClassroomBase,
  actionStage: actionStages.SUCCESS,
  type: types.CYCLE_QUERY_COMPLETION_BY_CLASSROOM_SUCCESS,
  cycleId,
  completionByClassroomId,
  payload: completionByClassroomId,
});

export const queryCompletionByClassroomFailure = error => ({
  ...queryCompletionByClassroomBase,
  actionStage: actionStages.FAILURE,
  type: types.CYCLE_QUERY_COMPLETION_BY_CLASSROOM_FAILURE,
  error: String(error),
});
