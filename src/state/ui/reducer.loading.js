/**
 * Dispatch action types that we want to have our loading reducer handle, should
 * take the following form:
 *
 * {
 *   // new action properties
 *   actionSlice: 'USERS',
 *   actionMethod: 'QUERY',
 *   actionStage: 'REQUEST',
 *   actionOptions: 'BY_TEAM', // not used by ui loading reducer
 *   actionUids: [], // to signal to this reducer what entity UIDs are affected
 *
 *   // legacy action properties, to be phased out
 *   type: 'USERS_QUERY_BY_TEAM_REQUEST',
 *
 *   // payload properties
 *   teamId: 'Team_001',
 * }
 * -----------------------------------------------------------------------------
 *
 * QUERY and ADD event types are slice level events.
 *
 * For example, if the following action was dispatched:
 *
 *   {
 *     actionSlice: 'TEAMS',
 *     actionMethod: 'QUERY',
 *     actionStage: 'REQUEST',
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       slices: {
 *         TEAMS: 'LOADING'
 *       }
 *     }
 *   }
 *
 * Or, if the following action was dispatched:
 *
 *   {
 *     actionSlice: 'USERS',
 *     actionMethod: 'ADD',
 *     actionStage: 'REQUEST',
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       slices: {
 *         USERS: 'ADDING'
 *       }
 *     }
 *   }
 *
 * -----------------------------------------------------------------------------
 *
 * GET, UPDATE, and DELETE are entity level events.
 *
 * For example, if the following action was dispatched:
 *
 *   {
 *     actionSlice: 'CYCLES',
 *     actionMethod: 'UPDATE',
 *     actionStage: 'REQUEST',
 *     actionUids: ['Cycle_001'],
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       entities: {
 *         Cycle_001: 'UPDATING'
 *       }
 *     }
 *   }
 *
 * -----------------------------------------------------------------------------
 *
 * BY_TEAM, BY_ORGANIZATION, are parent level events. These indicate that we
 * are querying for the children of a particular entity.
 *
 * For example, if the following action was dispatched:
 *
 *   {
 *     actionSlice: 'CLASSROOMS',
 *     actionOptins: 'BY_TEAM',
 *     actionMethod: 'QUERY',
 *     actionStage: 'REQUEST',
 *     teamId: 'Team_001',
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       parents: {
 *         Team_001: {
 *           CLASSROOMS: true,
 *         }
 *       }
 *     }
 *   }
 *
 * -----------------------------------------------------------------------------
 *
 * For all of the above, *_SUCCESS and *_FAILURE will remove the appropriate
 * entries from the `ui.loading` slice of the store.
 *
 * For example, if the following action was dispatched:
 *
 *   {
 *     actionSlice: 'CYCLES',
 *     actionMethod: 'QUERY',
 *     actionStage: 'SUCCESS',
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       slices: {
 *         // The following will no longer exist...
 *         // CYCLES: 'LOADING'
 *       }
 *     }
 *   }
 *
 * Or, if the following action was dispatched:
 *
 *   {
 *     actionSlice: 'USERS',
 *     actionMethod: 'UPDATE',
 *     actionStage: 'FAILURE',
 *     actionUids: ['User_001'],
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       entities: {
 *         // The following will no longer exist...
 *         // User_001: 'UPDATING'
 *       }
 *     }
 *   }
 *
 * -----------------------------------------------------------------------------
 *
 * HOA events are very similar to slice events, but they can have arbitrary
 * names. Conforming actions must have both an `actionPrefix` and an
 * `actionSlice`.
 *
 * For example, if the following action was dispatched:
 *
 *   {
 *     actionPrefix: 'HOA_REDIRECT',
 *     actionSlice: 'PROGRAMS',
 *     actionMethod: 'QUERY',
 *     actionStage: 'REQUEST',
 *   }
 *
 * Then the redux store would look like this:
 *
 *   ui: {
 *     loading: {
 *       hoaSlices: {
 *         HOA_REDIRECT_PROGRAMS: 'LOADING'
 *       }
 *     }
 *   }
 *
 * You may select for such states by provided a "stub" action to loading.hoa:
 *
 *   const mapStateToProps = (state, props) => ({
 *     isLoading: selectors.loading.hoa(createMyHoa())(state, props),
 *   })
 *
 * -----------------------------------------------------------------------------
 *
 * For examples on use, see
 * - src/scenes/Team (Redux connected)
 * - src/scenes/ClassroomsList (reusable, non-Redux connected)
 * - src/scenes/Home
 *
 */

import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import omit from 'lodash/omit';

import {
  actionMethodsFlags,
  actionStages,
  sliceActionTypesList,
  entityActionTypesList,
  hoaActionTypesList,
  byEntityLookup,
} from 'state/actionTypes';
import getLoadingKey from './getLoadingKey';
import initialState from './initialState';

const slicesReducer = (state = initialState.loading.slices, action) => {
  const { actionSlice, actionMethod, actionStage } = action;

  if (sliceActionTypesList.includes(actionMethod)) {
    if ([actionStages.REQUEST].includes(actionStage)) {
      return {
        ...state,
        [actionSlice]: actionMethodsFlags[actionMethod],
      };
    }

    if ([actionStages.SUCCESS, actionStages.FAILURE].includes(actionStage)) {
      return {
        ...omit(state, actionSlice),
      };
    }
  }

  return state;
};

const hoaSlicesReducer = (state = initialState.loading.hoaSlices, action) => {
  const { actionPrefix, actionMethod, actionStage } = action;

  const loadingKey = getLoadingKey(action);

  if (hoaActionTypesList.includes(actionMethod) && actionPrefix) {
    if ([actionStages.REQUEST].includes(actionStage)) {
      return {
        ...state,
        [loadingKey]: actionMethodsFlags[actionMethod],
      };
    }

    if ([actionStages.SUCCESS, actionStages.FAILURE].includes(actionStage)) {
      return {
        ...omit(state, loadingKey),
      };
    }
  }

  return state;
};

const parentsReducer = (state = initialState.loading.parents, action) => {
  const { actionSlice, actionOptions, actionStage } = action;

  if (!actionOptions || !byEntityLookup[actionOptions]) {
    return state;
  }

  // What entity uid to lookup by. Example teamId.
  const byId = byEntityLookup[actionOptions];
  const uid = action[byId];

  if (['REQUEST'].includes(actionStage)) {
    return {
      ...state,
      [uid]: {
        ...state[uid],
        [actionSlice]: true,
      },
    };
  }

  if (['SUCCESS', 'FAILURE'].includes(actionStage)) {
    return {
      ...state,
      [uid]: omit(state.uid, actionSlice),
    };
  }

  return state;
};

const entitiesReducer = (state = initialState.loading.entities, action) => {
  const { actionMethod, actionStage, actionUids } = action;

  if (entityActionTypesList.includes(actionMethod) && actionUids) {
    if (['REQUEST'].includes(actionStage)) {
      return {
        ...merge(
          {},
          state,
          ...actionUids.map(uid => ({
            [uid]: actionMethodsFlags[actionMethod],
          })),
        ),
      };
    }

    if (['SUCCESS', 'FAILURE'].includes(actionStage)) {
      return {
        ...omit(state, actionUids),
      };
    }
  }

  return state;
};

export default combineReducers({
  slices: slicesReducer,
  hoaSlices: hoaSlicesReducer,
  parents: parentsReducer,
  entities: entitiesReducer,
});
