import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

import {
  reducerById,
  reducerError,
  reducerLoading,
  reducerUpdating,
} from 'state/helpers';
import initialState from './initialState';
import {
  RESPONSES_REQUEST_ACTIONS,
  RESPONSES_SUCCESS_ACTIONS,
  RESPONSES_FAILURE_ACTIONS,
  RESPONSES_BY_TEAM_REQUEST,
  RESPONSES_BY_TEAM_SUCCESS,
  RESPONSES_BY_TEAM_FAILURE,
  RESPONSES_AU_REQUEST_ACTIONS,
  RESPONSES_AU_SUCCESS_ACTIONS,
  RESPONSES_AU_FAILURE_ACTIONS,
} from './actionTypes';

export default combineReducers({
  byId: reducerById(initialState, byId, RESPONSES_SUCCESS_ACTIONS),
  error: reducerError(
    initialState,
    RESPONSES_REQUEST_ACTIONS,
    RESPONSES_SUCCESS_ACTIONS,
    RESPONSES_FAILURE_ACTIONS,
  ),
  // Although we're using the same `byId` for both team and user responses,
  // we're using two loading flags because it takes two server requests to get
  // the data and our scenes need to know when both requests have completed.
  loading: reducerLoading(
    initialState,
    RESPONSES_BY_TEAM_REQUEST,
    RESPONSES_BY_TEAM_SUCCESS,
    RESPONSES_BY_TEAM_FAILURE,
  ),
  updating: reducerUpdating(
    initialState,
    RESPONSES_AU_REQUEST_ACTIONS,
    RESPONSES_AU_SUCCESS_ACTIONS,
    RESPONSES_AU_FAILURE_ACTIONS,
  ),
});

function byId(state = initialState.byId, action) {
  // `entitiesReducer` uses `action.payload`, don't try to handle those here.
  if (!action.responses && !action.response) {
    return state;
  }

  const responses = action.responses ? action.responses : [action.response];

  return {
    ...state,
    ...keyBy(responses, 'uid'),
  };
}
