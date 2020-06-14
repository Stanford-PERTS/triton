import { actionStages as stages } from 'state/actionTypes';
import { fullTypeOfAction } from 'state/helpers';

/**
 * Given an `action`, returns the _SUCCESS type version of that action. This is
 * useful in redux saga for yield take so that you aren't manually forming
 * the `type` you want to wait on.
 *
 * Example:
 *   yield take(successTypeOf(query('classrooms')));
 *   // will take when action.type is `CLASSROOMS_QUERY_SUCCESS`
 *
 * @param  {Object} action a redux action
 * @return {string}        a redux action type
 */
const successTypeOf = action => {
  if (!action.actionSlice || !action.actionMethod || !action.actionStage) {
    // eslint-disable-next-line no-console
    console.warn(
      'successTypeOf requires actionSlice, actionMethod, and actionStage',
      action,
    );
    return false;
  }

  return fullTypeOfAction({
    ...action,
    actionStage: stages.SUCCESS,
  });
};

export default successTypeOf;
