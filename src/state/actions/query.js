import { actionMethods, actionStages } from 'state/actionTypes';
import { SAVE_QUERY_LINKS } from 'state/links/actionTypes';
import { addActionTypeToAction } from 'state/helpers';
import byTypeFromUid from 'utils/byTypeFromUid';

// Example usage:
//
//   query('classrooms', {
//     byId: 'Team_2816a21d78f5',
//   });
//
// This would dispatch the following action:
//
//   {
//     actionSlice: 'CLASSROOMS',
//     actionMethod: 'QUERY',
//     actionByEntity: 'BY_TEAM',
//     actionStage: 'REQUEST',
//
//     type: 'CLASSROOMS_QUERY_BY_TEAM_REQUEST',
//
//     byId: 'Team_2816a21d78f5',
//   }

export const query = (sliceName, options = {}) => {
  let action = {
    // We can pass old patterned `type`s here.
    // Pass optional `params` here (like n, start_date, end_date, etc.).
    // Pass optional `byId` here (eg, for queryClassroomsByTeam).
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.QUERY,
    actionByEntity: options.byId && byTypeFromUid(options.byId),
    actionStage: actionStages.REQUEST,
  };

  action = addActionTypeToAction(action);

  return action;
};

// Example usage:
//
//   querySuccess('classrooms', classrooms, {
//     byId: 'Team_2816a21d78f5',
//   });
//
// This would dispatch the following action:
//
//   {
//     actionSlice: 'CLASSROOMS',
//     actionMethod: 'QUERY',
//     actionByEntity: 'BY_TEAM',
//     actionStage: 'SUCCESS',
//
//     type: 'CLASSROOMS_QUERY_BY_TEAM_SUCCESS',
//
//     byId: 'Team_2816a21d78f5',
//
//     payload,
//   }

export const querySuccess = (sliceName, payload = {}, options = {}) => {
  let action = {
    // We can pass old patterned `type`s here.
    // Any other options are just passed back via (most likely) a redux saga
    // so that reducers can properly process this action.
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.QUERY,
    actionByEntity: options.byId && byTypeFromUid(options.byId),
    actionStage: actionStages.SUCCESS,

    // To simplify, all our payload data comes back as `payload` so that we can
    // write a single reducer function for the common case of all slices of the
    // redux store.
    payload,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const queryFailure = (sliceName, error, options = {}) => {
  let action = {
    // We can pass old patterned `type`s here.
    // Any other options are just passed back via (most likely) a redux saga
    // so that reducers can properly process this action.
    ...options,

    actionSlice: sliceName.toUpperCase(),
    actionMethod: actionMethods.QUERY,
    actionByEntity: options.byId && byTypeFromUid(options.byId),
    actionStage: actionStages.FAILURE,

    error,
  };

  action = addActionTypeToAction(action);

  return action;
};

export const queryLinks = (sliceName, links) => ({
  type: SAVE_QUERY_LINKS,
  sliceName: sliceName.toLowerCase(),
  links,
});
