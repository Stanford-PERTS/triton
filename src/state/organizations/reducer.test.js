import initialState from './initialState';
import reducer from './reducer';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';

import deepFreeze from 'deep-freeze';
import keyBy from 'utils/keyBy';
import pickBy from 'lodash/pickBy';

describe('organizations reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no auth action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const state = { abc: 123, def: 456 };

    deepFreeze(state);

    const expected = state;
    const actual = reducer(state, action);
    expect(actual).toEqual(expected);
  });

  // Clear Flags
  it('should handle CLEAR_FLAGS', () => {
    const action = { type: CLEAR_FLAGS };
    const stateBefore = {
      ...initialState,
      error: { message: 'some error' },
    };
    const stateAfter = { ...stateBefore, error: null };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Query Organizations
  it('should handle ORGANIZATIONS_REQUEST', () => {
    const action = { type: types.ORGANIZATIONS_REQUEST };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle ORGANIZATIONS_SUCCESS', () => {
    const organizations = [
      { uid: 'Organization_001', name: 'Organization One' },
      { uid: 'Organization_002', name: 'Organization Two' },
    ];
    const links = {
      self: 'url',
      first: 'url',
      previous: 'url',
      next: 'url',
      last: 'url',
    };
    const action = { type: types.ORGANIZATIONS_SUCCESS, organizations, links };

    const stateBefore = { ...initialState, loading: true };
    const stateAfter = {
      ...stateBefore,
      byId: keyBy(organizations, 'uid'),
      lastFetched: organizations.map(o => o.uid),
      links,
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle ORGANIZATIONS_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.ORGANIZATIONS_FAILURE, error };

    const stateBefore = { ...initialState, error: null, loading: true };
    const stateAfter = { ...stateBefore, error, loading: false };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Get a Organization
  it('should handle ORGANIZATION_REQUEST', () => {
    const action = { type: types.ORGANIZATION_REQUEST };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a ORGANIZATION_SUCCESS', () => {
    const organizationsById = {
      Organization_001: {
        uid: 'Organization_001',
        name: 'Organization One',
      },
      Organization_002: {
        uid: 'Organization_002',
        name: 'Organization Two',
      },
    };
    const organization = {
      uid: 'Organization_003',
      name: 'Organization Three',
    };
    const action = { type: types.ORGANIZATION_SUCCESS, organization };

    const stateBefore = { ...initialState, organizationsById, loading: false };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(organization, 'uid'),
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle a ORGANIZATION_FAILURE', () => {
    const organizationsById = {
      Organization_001: {
        uid: 'Organization_001',
        name: 'Organization One',
      },
      Organization_002: {
        uid: 'Organization_002',
        name: 'Organization Two',
      },
    };
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.ORGANIZATION_FAILURE, error };

    const stateBefore = {
      ...initialState,
      organizationsById,
      error: null,
      loading: true,
    };
    const stateAfter = {
      ...stateBefore,
      organizationsById: pickBy(
        stateBefore.organizationsById,
        t => t.uid !== action.organizationId,
      ),
      error,
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  // Query Teams by Organization
  it('should handle ORGANIZATIONS_BY_TEAM_REQUEST', () => {
    const action = { type: types.ORGANIZATIONS_BY_TEAM_REQUEST };

    const stateBefore = { ...initialState, loading: false };
    const stateAfter = { ...stateBefore, loading: true };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle ORGANIZATIONS_BY_TEAM_SUCCESS', () => {
    const organizations = [
      { uid: 'Organization_001', name: 'Go Org One!' },
      { uid: 'Organization_002', name: 'Go Org Two!' },
    ];
    const action = { type: types.ORGANIZATIONS_BY_TEAM_SUCCESS, organizations };

    const stateBefore = { ...initialState, loading: true };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(organizations, 'uid'),
      },
      loading: false,
    };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  it('should handle ORGANIZATIONS_BY_TEAM_FAILURE', () => {
    const error = { code: '403', message: 'Unauthorized' };
    const action = { type: types.ORGANIZATIONS_BY_TEAM_FAILURE, error };

    const stateBefore = { ...initialState, error: null, loading: true };
    const stateAfter = { ...stateBefore, error, loading: false };

    deepFreeze(stateBefore);

    const expected = stateAfter;
    const actual = reducer(stateBefore, action);
    expect(actual).toEqual(expected);
  });

  describe('add', () => {
    it('should handle ORGANIZATION_ADD_REQUEST', () => {
      const action = { type: types.ORGANIZATION_ADD_REQUEST };

      const stateBefore = { ...initialState, adding: false };
      const stateAfter = { ...stateBefore, error: null, adding: true };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle ORGANIZATION_ADD_SUCCESS', () => {
      const organizationsById = {
        Organization_001: { uid: 'Organization_001', name: 'Go Org One!' },
        Organization_002: { uid: 'Organization_002', name: 'Go Org Two!' },
      };
      const organization = { uid: 'Organization_003', name: 'Go Org Three!' };
      const action = {
        type: types.ORGANIZATION_ADD_SUCCESS,
        organization,
      };

      const stateBefore = {
        ...initialState,
        byId: organizationsById,
        adding: true,
      };
      const stateAfter = {
        ...stateBefore,
        byId: {
          ...stateBefore.byId,
          ...keyBy(organization, 'uid'),
        },
        organizationMode: 'add',
        error: null,
        adding: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle ORGANIZATION_ADD_FAILURE', () => {
      const error = { code: '403', message: 'Unauthorized' };
      const action = {
        type: types.ORGANIZATION_ADD_FAILURE,
        error,
      };

      const stateBefore = {
        ...initialState,
        error: null,
        adding: true,
      };
      const stateAfter = {
        ...stateBefore,
        error: action.error,
        adding: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });

  describe('update', () => {
    it('should handle ORGANIZATION_UPDATE_REQUEST', () => {
      const organization = { uid: 'Organization_002', name: 'New Org Name' };
      const action = { type: types.ORGANIZATION_UPDATE_REQUEST, organization };

      const stateBefore = { ...initialState, updating: false };
      const stateAfter = { ...stateBefore, error: null, updating: true };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle a ORGANIZATION_UPDATE_SUCCESS', () => {
      const organizationsById = {
        Organization_001: { uid: 'Organization_001', name: 'Go Org One!' },
        Organization_002: { uid: 'Organization_002', name: 'Go Org Two!' },
      };
      const organization = { uid: 'Organization_003', name: 'New Org Name' };

      const action = { type: types.ORGANIZATION_UPDATE_SUCCESS, organization };

      const stateBefore = {
        ...initialState,
        byId: organizationsById,
        updating: true,
      };
      const stateAfter = {
        ...stateBefore,
        byId: {
          ...stateBefore.byId,
          ...keyBy(organization, 'uid'),
        },
        organizationMode: 'update',
        error: null,
        updating: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle ORGANIZATION_UPDATE_FAILURE', () => {
      const error = { code: '403', message: 'Unauthorized' };
      const action = {
        type: types.ORGANIZATION_UPDATE_FAILURE,
        error,
      };

      const stateBefore = {
        ...initialState,
        error: null,
        updating: true,
      };
      const stateAfter = {
        ...stateBefore,
        error,
        updating: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });

  describe('mode', () => {
    it('should handle ORGANIZATION_MODE_SET', () => {
      const organizationMode = 'some_mode';
      const stateBefore = {
        ...initialState,
        organizationMode: '',
      };
      const stateAfter = {
        ...stateBefore,
        organizationMode,
      };
      const action = {
        type: types.ORGANIZATION_MODE_SET,
        mode: organizationMode,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle ORGANIZATION_MODE_RESET', () => {
      const stateBefore = {
        ...initialState,
        organizationMode: 'mode',
      };
      const stateAfter = {
        ...stateBefore,
        organizationMode: '',
      };
      const action = { type: types.ORGANIZATION_MODE_RESET };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });
});
