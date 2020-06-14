import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';

export const add = (sliceName, entity, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.ADD,
    actionStage: actionStages.REQUEST,

    entity,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const addSuccess = (sliceName, payload, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.ADD,
    actionStage: actionStages.SUCCESS,

    payload: [payload],
  };

  action = addActionTypeToAction(action);

  return action;
};

export const addFailure = (sliceName, error, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.ADD,
    actionStage: actionStages.FAILURE,

    error,
  };

  action = addActionTypeToAction(action);

  return action;
};
