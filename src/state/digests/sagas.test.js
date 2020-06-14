import { all, takeLatest, put } from 'redux-saga/effects';
import _clone from 'lodash/clone';
import deepFreeze from 'deep-freeze';

import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as digestsApi from 'services/triton/digests';
import digestsSaga, {
  unreadUserDigestsRequest,
  allUserDigestsRequest,
  updateDigestRequest,
} from './sagas';

describe('digest sagas', () => {
  it('should takeLatest user digests request', () => {
    const gen = digestsSaga();

    expect(gen.next().value).toEqual(
      all([
        takeLatest(types.UNREAD_USER_DIGESTS_REQUEST, unreadUserDigestsRequest),
        takeLatest(types.ALL_USER_DIGESTS_REQUEST, allUserDigestsRequest),
        takeLatest(types.UPDATE_DIGEST_REQUEST, updateDigestRequest),
      ]),
    );
  });

  it('should handle a successful user digests request', () => {
    const action = {
      type: types.UNREAD_USER_DIGESTS_REQUEST,
      userId: 'User_Test123',
    };
    const digests = [
      { uid: 'Digest_001', read: false },
      { uid: 'Digest_002', read: false },
    ];

    // We want to write digests as read to the server, but definitely don't
    // want to change the store in the process.
    deepFreeze(digests);

    const gen = unreadUserDigestsRequest(action);

    // should call digestsApi.queryByUser
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(digestsApi.queryByUser, action.userId, 'false'),
    );

    for (const d of digests) {
      const digestCopy = _clone(d);
      digestCopy.read = true;
      // Only the first .next() needs the yield value here, but it doesn't
      // hurt to fill it in each time.
      expect(gen.next(digests).value).toEqual(
        callWithApiAuthentication(digestsApi.update, digestCopy),
      );
    }

    // should dispatch a USER_DIGESTS_SUCCESS
    expect(gen.next().value).toEqual(
      put({ type: types.USER_DIGESTS_SUCCESS, digests }),
    );
  });

  it('should handle a successful all user digests request', () => {
    const action = {
      type: types.ALL_USER_DIGESTS_REQUEST,
      userId: 'User_Test123',
    };
    const digests = [
      { uid: 'Digest_001', read: false },
      { uid: 'Digest_002', read: true },
    ];

    const gen = allUserDigestsRequest(action);

    // should call digestsApi.queryByUser
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(
        digestsApi.queryByUser,
        action.userId,
        undefined,
      ),
    );

    // should dispatch a USER_DIGESTS_SUCCESS
    expect(gen.next(digests).value).toEqual(
      put({ type: types.USER_DIGESTS_SUCCESS, digests }),
    );
  });

  it('should handle an unsuccessful user digests request', () => {
    const action = {
      type: types.UNREAD_USER_DIGESTS_REQUEST,
      userId: 'User_Test123',
    };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = unreadUserDigestsRequest(action);

    // should call digestsApi.get
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(digestsApi.queryByUser, action.userId, 'false'),
    );

    // should dispatch a USER_DIGESTS_FAILURE
    // (eg, in cases where a user isn't authorized to access resource)
    expect(gen.throw(error).value).toEqual(
      put({ type: types.USER_DIGESTS_FAILURE, error }),
    );
  });

  it('should handle a successful update digest request', () => {
    const digest = { read: true };
    const action = { type: types.UPDATE_DIGEST_REQUEST, digest };

    const gen = updateDigestRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(digestsApi.update, action.digest),
    );

    expect(gen.next(digest).value).toEqual(
      put({ type: types.UPDATE_DIGEST_SUCCESS, digest }),
    );
  });

  it('should handle an unsuccessful update digest request', () => {
    const digest = { read: false };
    const action = { type: types.UPDATE_DIGEST_REQUEST, digest };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = updateDigestRequest(action);

    expect(gen.next().value).toEqual(
      callWithApiAuthentication(digestsApi.update, action.digest),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.UPDATE_DIGEST_FAILURE, error }),
    );
  });
});
