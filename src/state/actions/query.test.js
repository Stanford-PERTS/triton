import * as actions from 'state/actions';
import { addActionTypeToAction } from 'state/helpers';

describe('redux query actions', () => {
  describe('query', () => {
    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionStage: 'REQUEST',

        type: 'USERS_QUERY_REQUEST',
      };

      const actual = addActionTypeToAction(actions.query('users'));
      const expected = action;

      expect(actual).toEqual(expected);
    });

    it('should return a redux action, with options', () => {
      const options = {
        params: { n: 10 },
      };
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionStage: 'REQUEST',

        type: 'USERS_QUERY_REQUEST',

        ...options,
      };

      const actual = addActionTypeToAction(actions.query('users', options));
      const expected = action;

      expect(actual).toEqual(expected);
    });

    it('should return a redux action, with byId', () => {
      const options = { byId: 'Team_001' };
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionByEntity: 'BY_TEAM',
        actionStage: 'REQUEST',

        type: 'USERS_QUERY_BY_TEAM_REQUEST',

        ...options,
      };

      const actual = addActionTypeToAction(actions.query('users', options));
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('querySuccess', () => {
    const payload = [
      { uid: 'User_001' },
      { uid: 'User_002' },
      { uid: 'User_003' },
    ];

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionStage: 'SUCCESS',

        type: 'USERS_QUERY_SUCCESS',

        payload,
      };

      const actual = addActionTypeToAction(
        actions.querySuccess('users', payload),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });

    it('should return a redux action, with options', () => {
      const options = {
        params: { n: 10 },
      };
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionStage: 'SUCCESS',

        type: 'USERS_QUERY_SUCCESS',

        ...options,

        payload,
      };

      const actual = addActionTypeToAction(
        actions.querySuccess('users', payload, options),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });

    it('should return a redux action, with byId', () => {
      const options = { byId: 'Team_001' };
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionByEntity: 'BY_TEAM',
        actionStage: 'SUCCESS',

        type: 'USERS_QUERY_BY_TEAM_SUCCESS',

        ...options,

        payload,
      };

      const actual = addActionTypeToAction(
        actions.querySuccess('users', payload, options),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });

  describe('queryFailure', () => {
    const error = {
      serverCode: 403,
      serverMessage: 'Forbidden',
    };

    it('should return a redux action', () => {
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionStage: 'FAILURE',

        type: 'USERS_QUERY_FAILURE',

        error,
      };

      const actual = addActionTypeToAction(
        actions.queryFailure('users', error),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });

    it('should return a redux action, with options', () => {
      const options = {
        params: { n: 10 },
      };
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionStage: 'FAILURE',

        type: 'USERS_QUERY_FAILURE',

        ...options,

        error,
      };

      const actual = addActionTypeToAction(
        actions.queryFailure('users', error, options),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });

    it('should return a redux action, with byId', () => {
      const options = { byId: 'Team_001' };
      const action = {
        actionSlice: 'USERS',
        actionMethod: 'QUERY',
        actionByEntity: 'BY_TEAM',
        actionStage: 'FAILURE',

        type: 'USERS_QUERY_BY_TEAM_FAILURE',

        ...options,

        error,
      };

      const actual = addActionTypeToAction(
        actions.queryFailure('users', error, options),
      );
      const expected = action;

      expect(actual).toEqual(expected);
    });
  });
});
