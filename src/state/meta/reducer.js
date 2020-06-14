// meta handles lastFetched, loading, and error
import { getMetaKeyFromAction } from 'state/helpers';
import { actionStages as stages } from 'state/actionTypes';

export default (state = {}, action) => {
  const { actionSlice, actionMethod, actionStage } = action;

  // only process our app actions
  if (!actionSlice || !actionMethod || !actionStage) {
    return state;
  }

  const key = getMetaKeyFromAction(action);

  if (actionStage === stages.REQUEST) {
    return {
      ...state,
      [key]: {
        ...state[key],
        loading: true,
        error: false,
      },
    };
  }

  if (actionStage === stages.SUCCESS) {
    return {
      ...state,
      [key]: {
        ...state[key],
        loading: false,
        error: false,
        // TODO make this reducer function pure
        lastFetched: Date.now(),
      },
    };
  }

  if (actionStage === stages.FAILURE) {
    return {
      ...state,
      [key]: {
        ...state[key],
        loading: false,
        error: action.error,
      },
    };
  }

  return state;
};
