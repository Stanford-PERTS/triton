/**
 * Constructs type strings for redux actions with more granular action*
 * properties. Noop if type is already present.
 * @param  {Object} action An redux action with (legacy) or without a type.
 * @return {Object}        An redux action with a type.
 * @throws {Error} If type is not set, and required action props are missing.
 */
const makeAction = action => {
  if ('type' in action) {
    return action;
  }
  ['actionSlice', 'actionMethod', 'actionStage'].forEach(p => {
    if (!action[p]) {
      throw new Error(`makeAction() requires action to have property '${p}'`);
    }
  });
  const parts = [
    action.actionPrefix, // optional
    action.actionSlice,
    action.actionMethod,
    action.actionName, // optional
    action.actionOptions, // optional
    action.actionStage,
  ];
  action.type = parts.filter(p => p).join('_');
  return action;
};

export default makeAction;
