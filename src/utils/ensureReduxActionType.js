/**
 * Redux middleware that ensures a `type` property appears in all dispatched
 * actions. Either the provided type is used or a type is formed using the
 * provided actionType, actionSlice, actionOptions and actionStage properties.
 */

const ensureReduxActionType = store => next => action => {
  // Default, use the provided action.type
  if (action.type) {
    return next(action);
  }

  // Else, let's form an action.type
  if (action.actionType && action.actionSlice && action.actionStage) {
    const { actionSlice, actionType, actionOptions, actionStage } = action;
    const options = actionOptions ? `_${actionOptions}` : '';
    const type = `${actionSlice}_${actionType}${options}_${actionStage}`;

    return next({
      ...action,
      type,
    });
  }

  return next(action);
};

export default ensureReduxActionType;
