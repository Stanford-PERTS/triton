import * as actions from 'state/actions';
import { addActionTypeToAction } from 'state/helpers';

describe('redux remove actions', () => {
  const user = {
    uid: 'User_2816a21d78f5',
    name: 'User To Remove',
    email: 'remove@me.com',
  };

  describe('remove', () => {
    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'REMOVE',
        actionStage: 'REQUEST',

        type: 'USERS_REMOVE_REQUEST',

        uid: user.uid,
      };

      const actual = addActionTypeToAction(actions.remove('users', user));
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('removeSuccess', () => {
    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'REMOVE',
        actionStage: 'SUCCESS',

        type: 'USERS_REMOVE_SUCCESS',

        uid: user.uid,
      };

      const actual = addActionTypeToAction(
        actions.removeSuccess('users', user.uid),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('removeFailure', () => {
    const error = {
      serverCode: 403,
      serverMessage: 'Forbidden',
    };

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'REMOVE',
        actionStage: 'FAILURE',

        type: 'USERS_REMOVE_FAILURE',

        error,
        uid: user.uid,
      };

      const actual = addActionTypeToAction(
        actions.removeFailure('users', user.uid, error),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });
});
