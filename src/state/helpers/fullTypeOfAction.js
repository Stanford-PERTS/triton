/**
 * Given an action with actionSlice, actionMethod, actionByEntity, actionStage,
 * this function returns the standard full redux action `type`.
 * @param  {string} action redux action object
 * @return {string}        redux action type
 */
const fullTypeOfAction = action => {
  const {
    actionPrefix,
    actionSlice,
    actionMethod,
    actionByEntity,
    actionStage,
  } = action;

  const prefix = actionPrefix ? `${actionPrefix}_` : '';
  const byEntity = actionByEntity ? `_${actionByEntity}` : '';

  const fullType = `${prefix}${actionSlice}_${actionMethod}${byEntity}_${actionStage}`;

  return fullType;
};

export default fullTypeOfAction;
