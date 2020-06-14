import * as actions from './actions';
import * as types from './actionTypes';

describe('digest actions', () => {
  it('should request digests for the user', () => {
    const userId = 'User_Test123';
    const expectedAction = {
      type: types.UNREAD_USER_DIGESTS_REQUEST,
      userId,
    };

    expect(actions.getUnreadUserDigests(userId)).toEqual(expectedAction);
  });

  it('should request all digests for the user', () => {
    const userId = 'User_Test123';
    const expectedAction = {
      type: types.ALL_USER_DIGESTS_REQUEST,
      userId,
    };

    expect(actions.getAllUserDigests(userId)).toEqual(expectedAction);
  });

  it('should request an update for the digest', () => {
    const digest = { uid: 'Digest_Test123' };
    const expectedAction = {
      type: types.UPDATE_DIGEST_REQUEST,
      digest,
    };

    expect(actions.updateDigest(digest)).toEqual(expectedAction);
  });
});
