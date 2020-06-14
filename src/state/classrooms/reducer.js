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
  CLASSROOM_AU_REQUEST_ACTIONS,
  CLASSROOM_AU_SUCCESS_ACTIONS,
  CLASSROOM_AU_FAILURE_ACTIONS,
  CLASSROOM_LOADING_REQUEST_ACTIONS,
  CLASSROOM_LOADING_SUCCESS_ACTIONS,
  CLASSROOM_LOADING_FAILURE_ACTIONS,
  CLASSROOM_REQUEST_ACTIONS,
  CLASSROOM_SUCCESS_ACTIONS,
  CLASSROOM_FAILURE_ACTIONS,
  CLASSROOM_REMOVE_REQUEST,
  CLASSROOM_REMOVE_SUCCESS,
  CLASSROOM_REMOVE_FAILURE,
  CLASSROOM_DETAIL_REQUEST,
  CLASSROOM_DETAIL_SUCCESS,
  CLASSROOM_DETAIL_FAILURE,
  CLASSROOM_MODE_SET,
  CLASSROOM_MODE_RESET,
} from './actionTypes';

export default combineReducers({
  byId: reducerById(initialState, classroomsById, CLASSROOM_SUCCESS_ACTIONS),
  classroomMode: classroomModeReducer,
  error: reducerError(
    initialState,
    CLASSROOM_REQUEST_ACTIONS,
    CLASSROOM_SUCCESS_ACTIONS,
    CLASSROOM_FAILURE_ACTIONS,
  ),
  loading: reducerLoading(
    initialState,
    CLASSROOM_LOADING_REQUEST_ACTIONS,
    CLASSROOM_LOADING_SUCCESS_ACTIONS,
    CLASSROOM_LOADING_FAILURE_ACTIONS,
  ),
  loadingClassroomDetails: loadingClassroomDetailsReducer,
  updating: reducerUpdating(
    initialState,
    CLASSROOM_AU_REQUEST_ACTIONS,
    CLASSROOM_AU_SUCCESS_ACTIONS,
    CLASSROOM_AU_FAILURE_ACTIONS,
  ),
  deleting: reducerUpdating(
    initialState,
    CLASSROOM_REMOVE_REQUEST,
    CLASSROOM_REMOVE_SUCCESS,
    CLASSROOM_REMOVE_FAILURE,
  ),
  lastFetched: (state = initialState.lastFetched) => state,
  queryResults: (state = initialState.queryResults) => state,
});

export function classroomsById(state, action) {
  if (action.type === CLASSROOM_REMOVE_SUCCESS) {
    return omit(state, action.classroomId);
  }

  return {
    ...state,
    ...(action.classrooms && keyBy(action.classrooms, 'uid')),
    ...(action.classroom && keyBy(action.classroom, 'uid')),
  };
}

function classroomModeReducer(state = initialState.classroomMode, action) {
  switch (action.type) {
    case CLASSROOM_MODE_SET:
      return action.mode;
    case CLASSROOM_MODE_RESET:
      return initialState.classroomMode;
    default:
      return state;
  }
}

function loadingClassroomDetailsReducer(
  state = initialState.loadingClassroomDetails,
  action,
) {
  switch (action.type) {
    case CLASSROOM_DETAIL_REQUEST:
      return true;

    case CLASSROOM_DETAIL_SUCCESS:
    case CLASSROOM_DETAIL_FAILURE:
      return false;

    default:
      return state;
  }
}
