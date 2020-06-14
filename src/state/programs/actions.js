import { actionStages, actionMethods } from 'state/actionTypes';
import { makeAction } from 'state/helpers';
import addActionTypeToAction from 'state/helpers/addActionTypeToAction';

const slice = 'PROGRAMS';

const HOA_REDIRECT = 'HOA_REDIRECT';

export const userProgramRedirect = programLabel =>
  addActionTypeToAction({
    actionPrefix: HOA_REDIRECT,
    actionSlice: slice,
    actionMethod: actionMethods.QUERY,
    actionStage: actionStages.REQUEST,
    programLabel,
  });

export const userProgramRedirectSuccess = () =>
  addActionTypeToAction({
    actionPrefix: HOA_REDIRECT,
    actionSlice: slice,
    actionMethod: actionMethods.QUERY,
    actionStage: actionStages.SUCCESS,
  });

export const userProgramRedirectFailure = error =>
  addActionTypeToAction({
    actionPrefix: HOA_REDIRECT,
    actionSlice: slice,
    actionMethod: actionMethods.QUERY,
    actionStage: actionStages.ERROR,
    error: String(error),
  });

const searchBase = {
  actionPrefix: 'HOA',
  actionMethod: actionMethods.QUERY,
  actionSlice: slice,
  actionName: 'SEARCH',
};

export const search = (query = '', programLabel) =>
  makeAction({
    ...searchBase,
    actionStage: actionStages.REQUEST,
    query,
    programLabel,
    // This will be copied onto atomic success actions in the saga so the
    // results can be indexed separately. It will NOT be present on the
    // corresponding HOA success action.
    queryName: 'programSearch',
  });

export const searchSuccess = () =>
  makeAction({
    ...searchBase,
    actionStage: actionStages.SUCCESS,
  });

export const searchFailure = error =>
  makeAction({
    ...searchBase,
    actionStage: actionStages.FAILURE,
    error: String(error),
  });
