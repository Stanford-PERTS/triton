import { fullTypeOfAction } from 'state/helpers';

/**
 * Adds `.type`, to the provided `action`, if it does not already have one.
 * @param  {string} action redux action object
 * @return {string}        redux action object
 */
const addActionTypeToAction = action => {
  // Default, use the provided `action.type`. Providing a `type` via the
  // action function's `options` parameter allows you to override this.
  //
  // For example:
  //   query('classrooms', { type: 'GET_ALL_THE_CLASSROOMS' })
  //
  // See src/state/actions for how this works.
  if (action.type) {
    return action;
  }

  // Else, let's form an action with `type`.
  if (action.actionMethod && action.actionSlice && action.actionStage) {
    return {
      ...action,
      type: fullTypeOfAction(action),
    };
  }

  return action;
};

export default addActionTypeToAction;
