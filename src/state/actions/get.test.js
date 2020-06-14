import * as actions from 'state/actions';
import { addActionTypeToAction } from 'state/helpers';

describe('redux get actions', () => {
  const uid = 'User_2816a21d78f5';

  describe('get', () => {
    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'GET',
        actionStage: 'REQUEST',

        type: 'USERS_GET_REQUEST',

        uid,
      };

      const actual = addActionTypeToAction(actions.get('users', uid));
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('getSuccess', () => {
    const payload = { uid: 'User_001' };

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'GET',
        actionStage: 'SUCCESS',

        type: 'USERS_GET_SUCCESS',

        payload: [payload],
        uid,
      };

      const actual = addActionTypeToAction(
        actions.getSuccess('users', uid, payload),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('getFailure', () => {
    const error = {
      serverCode: 403,
      serverMessage: 'Forbidden',
    };

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'GET',
        actionStage: 'FAILURE',

        type: 'USERS_GET_FAILURE',

        error,
        uid,
      };

      const actual = addActionTypeToAction(
        actions.getFailure('users', uid, error),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });
});
