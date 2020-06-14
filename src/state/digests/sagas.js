import { all, takeLatest, put } from 'redux-saga/effects';
import _clone from 'lodash/clone';

import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as digestsApi from 'services/triton/digests';

export function* unreadUserDigestsRequest(action) {
  try {
    const digests = yield callWithApiAuthentication(
      digestsApi.queryByUser,
      action.userId,
      'false', // only unread digests
    );
    // Update all the received digests to mark them as read, but don't change
    // the ones in the redux store b/c they should _display_ as unread until
    // the next page load.
    for (const d of digests) {
      const digestCopy = _clone(d);
      digestCopy.read = true;
      yield callWithApiAuthentication(digestsApi.update, digestCopy);
    }
    yield put({
      type: types.USER_DIGESTS_SUCCESS,
      digests,
    });
  } catch (error) {
    yield put({
      type: types.USER_DIGESTS_FAILURE,
      error,
    });
  }
}

export function* allUserDigestsRequest(action) {
  try {
    const digests = yield callWithApiAuthentication(
      digestsApi.queryByUser,
      action.userId,
      undefined, // with read as either true or false
    );
    // Use the same response-handling actions as the other query.
    yield put({
      type: types.USER_DIGESTS_SUCCESS,
      digests,
    });
  } catch (error) {
    yield put({
      type: types.USER_DIGESTS_FAILURE,
      error,
    });
  }
}

export function* updateDigestRequest(action) {
  try {
    const digest = yield callWithApiAuthentication(
      digestsApi.update,
      action.digest,
    );
    yield put({
      type: types.UPDATE_DIGEST_SUCCESS,
      digest,
    });
  } catch (error) {
    yield put({ type: types.UPDATE_DIGEST_FAILURE, error });
  }
}

export default function* digestsSaga() {
  yield all([
    takeLatest(types.UNREAD_USER_DIGESTS_REQUEST, unreadUserDigestsRequest),
    takeLatest(types.ALL_USER_DIGESTS_REQUEST, allUserDigestsRequest),
    takeLatest(types.UPDATE_DIGEST_REQUEST, updateDigestRequest),
  ]);
}
