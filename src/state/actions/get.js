import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';

export const get = (sliceName, uid, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.GET,
    actionStage: actionStages.REQUEST,

    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const getSuccess = (sliceName, uid, payload, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.GET,
    actionStage: actionStages.SUCCESS,

    // The simplify our reducers, we can set them up so they are always
    // handling the payload as if it is an array.
    payload: [payload],
    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const getFailure = (sliceName, uid, error, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.GET,
    actionStage: actionStages.FAILURE,

    error,
    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};
