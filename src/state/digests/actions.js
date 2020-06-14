import * as types from './actionTypes';

/**
 * Query /api/users/:userId/digests?read=false and then also update all
 * received digests to have read = true.
 * @param {string} uid - id of digest recipient.
 * @returns {Object} action
 */
export const getUnreadUserDigests = uid => ({
  type: types.UNREAD_USER_DIGESTS_REQUEST,
  userId: uid,
});

export const getAllUserDigests = uid => ({
  type: types.ALL_USER_DIGESTS_REQUEST,
  userId: uid,
});

export const updateDigest = digest => ({
  type: types.UPDATE_DIGEST_REQUEST,
  digest,
});
