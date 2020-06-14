import { combineReducers } from 'redux';
import keyBy from 'utils/keyBy';
import { reducerById, reducerError, reducerLoading } from 'state/helpers';
import initialState from './initialState';
import {
  SURVEY_REQUEST_ACTIONS,
  SURVEY_SUCCESS_ACTIONS,
  SURVEY_FAILURE_ACTIONS,
} from './actionTypes';

// Redux form uses this object to initialize it's state
export const getActiveMetrics = (metrics = []) =>
  metrics.reduce((o, m) => {
    o[m] = true;
    return o;
  }, {});

export default combineReducers({
  activeMetrics,
  byId: reducerById(initialState, surveysById, SURVEY_SUCCESS_ACTIONS),
  error: reducerError(
    initialState,
    SURVEY_REQUEST_ACTIONS,
    SURVEY_SUCCESS_ACTIONS,
    SURVEY_FAILURE_ACTIONS,
  ),
  loading: reducerLoading(
    initialState,
    SURVEY_REQUEST_ACTIONS,
    SURVEY_SUCCESS_ACTIONS,
    SURVEY_FAILURE_ACTIONS,
  ),
});

function surveysById(state, action) {
  return {
    ...state,
    ...keyBy(action.survey, 'uid'),
  };
}

function activeMetrics(state = initialState.activeMetrics, action) {
  if (action.type.match(SURVEY_SUCCESS_ACTIONS)) {
    return getActiveMetrics(action.survey.metrics);
  }

  return state;
}
