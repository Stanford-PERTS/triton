import { actionMethods, actionStages } from 'state/actionTypes';
import { addActionTypeToAction } from 'state/helpers';

export const update = (sliceName, entity, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.UPDATE,
    actionStage: actionStages.REQUEST,

    entity,
    uid: entity && entity.uid,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const updateSuccess = (sliceName, uid, payload, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.UPDATE,
    actionStage: actionStages.SUCCESS,

    payload,
    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const updateFailure = (sliceName, uid, error, options = {}) => {
  let action = {
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.UPDATE,
    actionStage: actionStages.FAILURE,

    error,
    uid,
  };

  action = addActionTypeToAction(action);

  return action;
};
