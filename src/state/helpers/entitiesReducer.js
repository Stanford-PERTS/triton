import {
  actionMethods as methods,
  actionStages as stages,
} from 'state/actionTypes';
import _keyBy from 'lodash/keyBy';
import _omit from 'lodash/omit';

/**
 * Returns an entities reducer that handles inserting/removing entities into the
 * entities's state keyed by uid.
 *
 * Usage:
 *
 *   combineReducers({
 *     classrooms: entitiesReducer('classrooms', defaultInitialState),
 *     cycles: entitiesReducer('cycles', defaultInitialState),
 *     teams: entitiesReducer('teams', defaultInitialState),
 *     ...etc
 *   })
 *
 * @param  {String}   sliceName    the slice's name
 * @param  {Object}   initialState the slice's initialState
 * @return {Function}              reducer function
 */
const entitiesReducer = (sliceName, initialState = {}) =>
  function reducer(state = initialState, action) {
    // HOA success actions don't always have a payload.
    if (action.payload === undefined) {
      return state;
    }

    const { actionSlice, actionMethod, actionStage } = action;

    // This reducer should only handle actions related to this slice.
    // This reducer should only handle success actions.
    if (
      actionSlice !== sliceName.toUpperCase() ||
      actionStage !== stages.SUCCESS
    ) {
      return state;
    }

    // Insert entity/entities and update lastFetched.
    if ([methods.QUERY, methods.GET].includes(actionMethod)) {
      // N.B. assume `payload` is always an array of entities, even if single.
      const payload =
        action.payload instanceof Array ? action.payload : [action.payload];

      // If the action has a name, track the ids of the results in a dedicated
      // array. This allows persistent storage of things like a page of
      // results, or results from a search.
      const queryResults = {};
      if (action.queryName) {
        queryResults[action.queryName] = payload.map(e => e.uid);
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          ..._keyBy(payload, 'uid'),
        },
        lastFetched: payload.map(e => e.uid),
        queryResults: {
          ...state.queryResults,
          ...queryResults,
        },
      };
    }

    // Insert/update entity/entities and clear lastFetched.
    // After an ADD or UPDATE we assume that any fetched lists are out of date
    // b/c either there's an new entity that might match, or the update entity
    // may match differently.
    if ([methods.ADD, methods.UPDATE].includes(actionMethod)) {
      // N.B. assume `payload` is always an array of entities, even if single.
      const payload =
        action.payload instanceof Array ? action.payload : [action.payload];

      return {
        ...state,
        byId: {
          ...state.byId,
          ..._keyBy(payload, 'uid'),
        },
        lastFetched: [],
      };
    }

    // Remove entity from store and clear lastFetched.
    // After a DELETE we assume that any fetched lists are out of date.
    // Will only ever remove a single entity at a time.
    if ([methods.REMOVE].includes(actionMethod)) {
      // N.B. Assuming `payload` is NOT an array, just the one object that
      // has been deleted.
      return {
        ...state,
        byId: _omit(state.byId, action.payload.uid),
        lastFetched: [],
      };
    }

    return state;
  };

export default entitiesReducer;
