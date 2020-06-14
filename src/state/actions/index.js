import { CLEAR_FLAGS } from 'state/actionTypes';

export const clearFlags = () => ({ type: CLEAR_FLAGS });

export const initAction = {
  // https://github.com/reduxjs/redux/blob/master/src/utils/actionTypes.js#L16
  // Redux dispatches a `@@redux/INIT${randomString()}` action type on start.
  // So we're approximating that here for reducer init tests.
  type: '@@redux/INIT',
};

export {
  query,
  querySuccess,
  queryFailure,
  queryLinks,
} from 'state/actions/query';
export { get, getSuccess, getFailure } from 'state/actions/get';
export { add, addSuccess, addFailure } from 'state/actions/add';
export { update, updateSuccess, updateFailure } from 'state/actions/update';
export { remove, removeSuccess, removeFailure } from 'state/actions/remove';
