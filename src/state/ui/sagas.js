import { all, takeLatest, put } from 'redux-saga/effects';
import * as types from './actionTypes';

export function* flashSet(action) {
  const defaultTimeout = 10 * 1000;

  yield new Promise(resolve =>
    setTimeout(resolve, action.time || defaultTimeout),
  );
  yield put({ type: types.FLASH_DELETE, flashKey: action.flashKey });
}

export default function* uiSaga() {
  yield all([takeLatest(types.FLASH_SET, flashSet)]);
}
