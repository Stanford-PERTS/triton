import { combineReducers } from 'redux';
import keyBy from 'utils/keyBy';
import omit from 'lodash/omit';

import {
  reducerById,
  reducerError,
  reducerLoading,
  reducerUpdating,
} from 'state/helpers';
import initialState from './initialState';
import {
  CYCLE_LOADING_REQUEST_ACTIONS,
  CYCLE_LOADING_SUCCESS_ACTIONS,
  CYCLE_LOADING_FAILURE_ACTIONS,
  CYCLE_REQUEST_ACTIONS,
  CYCLE_SUCCESS_ACTIONS,
  CYCLE_FAILURE_ACTIONS,
  CYCLE_AU_REQUEST_ACTIONS,
  CYCLE_AU_SUCCESS_ACTIONS,
  CYCLE_AU_FAILURE_ACTIONS,
  CYCLE_REMOVE_SUCCESS,
  CYCLE_QUERY_PARTICIPATION_BY_TEAM_REQUEST,
  CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS,
  CYCLE_QUERY_PARTICIPATION_BY_TEAM_FAILURE,
  CYCLE_QUERY_COMPLETION_BY_CLASSROOM_REQUEST,
  CYCLE_QUERY_COMPLETION_BY_CLASSROOM_SUCCESS,
  CYCLE_QUERY_COMPLETION_BY_CLASSROOM_FAILURE,
} from './actionTypes';

export default combineReducers({
  byId: reducerById(initialState, cyclesById, CYCLE_SUCCESS_ACTIONS),
  classroomParticipationById,
  classroomCompletionById,
  error: reducerError(
    initialState,
    CYCLE_REQUEST_ACTIONS,
    CYCLE_SUCCESS_ACTIONS,
    CYCLE_FAILURE_ACTIONS,
  ),
  loading: reducerLoading(
    initialState,
    CYCLE_LOADING_REQUEST_ACTIONS,
    CYCLE_LOADING_SUCCESS_ACTIONS,
    CYCLE_LOADING_FAILURE_ACTIONS,
  ),
  loadingParticipation: loadingParticipationReducer,
  loadingCompletion: loadingCompletionReducer,
  updating: reducerUpdating(
    initialState,
    CYCLE_AU_REQUEST_ACTIONS,
    CYCLE_AU_SUCCESS_ACTIONS,
    CYCLE_AU_FAILURE_ACTIONS,
  ),
  lastFetched: (state = initialState.lastFetched) => state,
  queryResults: (state = initialState.queryResults) => state,
});

export function cyclesById(state, action) {
  if (action.type === CYCLE_REMOVE_SUCCESS) {
    return omit(state, action.cycle.uid);
  }

  return {
    ...state,
    ...(action.cycles && keyBy(action.cycles, 'uid')),
    ...(action.cycle && keyBy(action.cycle, 'uid')),
  };
}

function classroomParticipationById(
  state = initialState.classroomParticipationById,
  action,
) {
  if (action.type === CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS) {
    return {
      ...state,
      [action.cycleId]: {
        ...state.cycleId,
        ...action.participationByClassroomId,
      },
    };
  }
  return state;
}

function loadingParticipationReducer(
  state = initialState.loadingParticipation,
  action,
) {
  switch (action.type) {
    case CYCLE_QUERY_PARTICIPATION_BY_TEAM_REQUEST:
      return true;

    case CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS:
    case CYCLE_QUERY_PARTICIPATION_BY_TEAM_FAILURE:
      return false;

    default:
      return state;
  }
}

function classroomCompletionById(
  state = initialState.classroomCompletionById,
  action,
) {
  if (action.type === CYCLE_QUERY_COMPLETION_BY_CLASSROOM_SUCCESS) {
    return {
      ...state,
      [action.cycleId]: {
        ...state.cycleId,
        ...action.completionByClassroomId,
      },
    };
  }
  return state;
}

function loadingCompletionReducer(
  state = initialState.loadingCompletion,
  action,
) {
  switch (action.type) {
    case CYCLE_QUERY_COMPLETION_BY_CLASSROOM_REQUEST:
      return true;

    case CYCLE_QUERY_COMPLETION_BY_CLASSROOM_SUCCESS:
    case CYCLE_QUERY_COMPLETION_BY_CLASSROOM_FAILURE:
      return false;

    default:
      return state;
  }
}
