import { put, race, take } from 'redux-saga/effects';
import { failureTypeOf, successTypeOf } from 'state/helpers';

function* putAndTakePayload(action, successType, failureType) {
  yield put(action);

  const { success, failure } = yield race({
    success: take(successType || successTypeOf(action)),
    failure: take(failureType || failureTypeOf(action)),
  });

  return { success: success && success.payload, failure };
}

export default putAndTakePayload;
