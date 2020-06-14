import * as actions from 'state/actions';
import { addActionTypeToAction } from 'state/helpers';

describe('redux add actions', () => {
  const entity = { name: 'Mister Fox' };

  describe('add', () => {
    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'ADD',
        actionStage: 'REQUEST',

        type: 'USERS_ADD_REQUEST',

        entity,
      };

      const actual = addActionTypeToAction(actions.add('users', entity));
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('addSuccess', () => {
    const payload = { uid: 'User_001', name: entity.name };

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'ADD',
        actionStage: 'SUCCESS',

        type: 'USERS_ADD_SUCCESS',

        payload: [payload],
      };

      const actual = addActionTypeToAction(
        actions.addSuccess('users', payload),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('addFailure', () => {
    const error = {
      serverCode: 403,
      serverMessage: 'Forbidden',
    };

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'ADD',
        actionStage: 'FAILURE',

        type: 'USERS_ADD_FAILURE',

        error,
      };

      const actual = addActionTypeToAction(actions.addFailure('users', error));
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });
});
