/**
 * Returns a reducer function for storing entities `byId`. If the `action.type`
 * matches the provided `successRegex`, then the `stateShaper` function will be
 * called on the `(state, action)`.
 *
 * The `stateShaper` function should return only the new `byId` state.
 *
 * Assumptions:
 * - entities byId are stored on the slices 'byId' property.
 *
 * Usage:
 *
 *   import { combineReducers } from 'redux';
 *   import { reducerById } from 'state/helpers';
 *   import keyBy from 'utils/keyBy';
 *   import { SURVEY_SUCCESS_ACTIONS } from './actionTypes';
 *   import initialState from './initialState';
 *
 *   export default combineReducers({
 *     byId: reducerById(initialState, surveysById, SURVEY_SUCCESS_ACTIONS),
 *   });
 *
 *   function surveysById(state, action) {
 *     return {
 *       ...state,
 *       ...keyBy(action.survey, 'uid'),
 *     };
 *   }
 *
 * @param  {Object}   initialState the slice's initialState
 * @param  {Function} stateShaper  reducer for the byId property of slice
 * @param  {RegExp}   successRegex success regex to match against action.type
 * @return {Function}              reducer function
 */

const reducerById = (initialState, stateShaper, successRegex) =>
  function byId(state = initialState.byId, action) {
    if (action.type.match(successRegex)) {
      return stateShaper(state, action);
    }

    return state;
  };

export default reducerById;
