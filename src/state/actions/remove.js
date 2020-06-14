import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';

export const remove = (sliceName, entity, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.REMOVE,
    actionStage: actionStages.REQUEST,

    uid: entity && entity.uid,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const removeSuccess = (sliceName, uid, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.REMOVE,
    actionStage: actionStages.SUCCESS,

    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const removeFailure = (sliceName, uid, error, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.REMOVE,
    actionStage: actionStages.FAILURE,

    error,
    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};
