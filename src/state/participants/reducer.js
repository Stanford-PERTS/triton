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
import * as types from './actionTypes';

export default combineReducers({
  byId: reducerById(
    initialState,
    reduceById,
    types.PARTICIPANTS_SUCCESS_ACTIONS,
  ),
  error: reducerError(
    initialState,
    types.PARTICIPANTS_REQUEST_ACTIONS,
    types.PARTICIPANTS_SUCCESS_ACTIONS,
    types.PARTICIPANTS_FAILURE_ACTIONS,
  ),
  loading: reducerLoading(
    initialState,
    types.PARTICIPANTS_QUERY_REQUEST_ACTIONS,
    types.PARTICIPANTS_QUERY_SUCCESS_ACTIONS,
    types.PARTICIPANTS_QUERY_FAILURE_ACTIONS,
  ),
  updating: reducerUpdating(
    initialState,
    types.PARTICIPANTS_UPDATING_REQUEST_ACTIONS,
    types.PARTICIPANTS_UPDATING_SUCCESS_ACTIONS,
    types.PARTICIPANTS_UPDATING_FAILURE_ACTIONS,
  ),
  lastFetched: (state = initialState.lastFetched) => state,
  queryResults: (state = initialState.queryResults) => state,
});

export function reduceById(state, action) {
  if (action.type === types.PARTICIPANTS_REMOVE_SUCCESS) {
    return omit(state, action.participantIds);
  }

  return {
    ...state,
    ...(action.participants && keyBy(action.participants, 'uid')),
    ...(action.participant && keyBy(action.participant, 'uid')),
  };
}
