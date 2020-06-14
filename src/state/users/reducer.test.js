import pickBy from 'lodash/pickBy';
import keyBy from 'utils/keyBy';

import reducer from './reducer';
import * as types from './actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import initialState from './initialState';
import deepFreeze from 'deep-freeze';

describe('user reducer', () => {
  // Init and Default
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return state when no user action types present', () => {
    const action = { type: 'ANOTHER_ACTION_TYPE' };
    const stateBefore = { abc: 123, def: 456 };
    const stateAfter = { abc: 123, def: 456 };

    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Clear Flags
  it('handles CLEAR_FLAGS', () => {
    const action = { type: CLEAR_FLAGS };
    const stateBefore = {
      error: { message: 'some error' },
    };
    const stateAfter = { error: null };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Query Users by Team
  it('handles USERS_BY_TEAM_REQUEST', () => {
    const teamId = 'Team_001';
    const action = { type: types.USERS_BY_TEAM_REQUEST, teamId };

    const stateBefore = { byId: {}, error: null, loading: false };
    const stateAfter = { byId: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_TEAM_SUCCESS', () => {
    const users = [
      { uid: 'User_001', name: 'User One', owned_teams: ['Team_001'] },
      { uid: 'User_002', name: 'User Two', owned_teams: ['Team_001'] },
      { uid: 'User_003', name: 'User Three', owned_teams: ['Team_001'] },
      { uid: 'User_004', name: 'User Four', owned_teams: ['Team_001'] },
      { uid: 'User_005', name: 'User Five', owned_teams: ['Team_001'] },
    ];
    const teamId = 'Team_001';
    const action = { type: types.USERS_BY_TEAM_SUCCESS, teamId, users };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: keyBy(users, u => u.uid),
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_TEAM_SUCCESS, handle existing users', () => {
    const users = [
      { uid: 'User_001', name: 'User One', owned_teams: ['Team_001'] },
      { uid: 'User_002', name: 'User Two', owned_teams: ['Team_001'] },
      { uid: 'User_003', name: 'User Three', owned_teams: ['Team_001'] },
      { uid: 'User_004', name: 'User Four', owned_teams: ['Team_001'] },
      { uid: 'User_005', name: 'User Five', owned_teams: ['Team_001'] },
    ];
    const newUsers = [
      { uid: 'User_006', name: 'User One', owned_teams: ['Team_002'] },
      { uid: 'User_007', name: 'User Two', owned_teams: ['Team_002'] },
    ];
    const teamId = 'Team_002';
    const action = {
      type: types.USERS_BY_TEAM_SUCCESS,
      teamId,
      users: newUsers,
    };

    const stateBefore = {
      byId: keyBy(users, u => u.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: {
        ...keyBy(users, u => u.uid),
        ...keyBy(newUsers, u => u.uid),
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_TEAM_FAILURE', () => {
    const teamId = 'Team_001';
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.USERS_BY_TEAM_FAILURE, error, teamId };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: {},
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_TEAM_FAILURE, existing users, new teamId', () => {
    const users = [
      { uid: 'User_001', name: 'User One', owned_teams: ['Team_001'] },
      { uid: 'User_002', name: 'User Two', owned_teams: ['Team_001'] },
      { uid: 'User_003', name: 'User Three', owned_teams: ['Team_002'] },
      { uid: 'User_004', name: 'User Four', owned_teams: ['Team_002'] },
      { uid: 'User_005', name: 'User Five', owned_teams: ['Team_003'] },
    ];
    const teamId = 'Team_005';
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.USERS_BY_TEAM_FAILURE, error, teamId };

    const stateBefore = {
      byId: keyBy(users, u => u.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: pickBy(
        keyBy(users, u => u.uid),
        u => !u.owned_teams.includes(action.teamId),
      ),
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_TEAM_FAILURE, existing users, existing teamId', () => {
    const users = [
      { uid: 'User_001', name: 'User One', owned_teams: ['Team_001'] },
      { uid: 'User_002', name: 'User Two', owned_teams: ['Team_001'] },
      { uid: 'User_003', name: 'User Three', owned_teams: ['Team_002'] },
      { uid: 'User_004', name: 'User Four', owned_teams: ['Team_002'] },
      { uid: 'User_005', name: 'User Five', owned_teams: ['Team_003'] },
    ];
    const teamId = 'Team_002';
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.USERS_BY_TEAM_FAILURE, error, teamId };

    const stateBefore = {
      byId: keyBy(users, u => u.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: pickBy(
        keyBy(users, u => u.uid),
        u => !u.owned_teams.includes(action.teamId),
      ),
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Query Users by Organization
  it('handles USERS_BY_ORGANIZATION_REQUEST', () => {
    const organizationId = 'Organization_001';
    const action = {
      type: types.USERS_BY_ORGANIZATION_REQUEST,
      organizationId,
    };

    const stateBefore = { usersById: {}, error: null, loading: false };
    const stateAfter = { usersById: {}, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_ORGANIZATION_SUCCESS', () => {
    const users = [
      {
        uid: 'User_001',
        name: 'User One',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_002',
        name: 'User Two',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_003',
        name: 'User Three',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_004',
        name: 'User Four',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_005',
        name: 'User Five',
        owned_organizations: ['Organization_001'],
      },
    ];
    const organizationId = 'Organization_001';
    const action = {
      type: types.USERS_BY_ORGANIZATION_SUCCESS,
      organizationId,
      users,
    };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: keyBy(users, u => u.uid),
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_ORGANIZATION_SUCCESS, handle existing users', () => {
    const users = [
      {
        uid: 'User_001',
        name: 'User One',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_002',
        name: 'User Two',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_003',
        name: 'User Three',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_004',
        name: 'User Four',
        owned_organizations: ['Organization_001'],
      },
      {
        uid: 'User_005',
        name: 'User Five',
        owned_organizations: ['Organization_001'],
      },
    ];
    const newUsers = [
      {
        uid: 'User_006',
        name: 'User One',
        owned_organizations: ['Organization_002'],
      },
      {
        uid: 'User_007',
        name: 'User Two',
        owned_organizations: ['Organization_002'],
      },
    ];
    const organizationId = 'Organization_002';
    const action = {
      type: types.USERS_BY_ORGANIZATION_SUCCESS,
      organizationId,
      users: newUsers,
    };

    const stateBefore = {
      byId: keyBy(users, u => u.uid),
      error: null,
      loading: true,
    };
    const stateAfter = {
      byId: {
        ...keyBy(users, u => u.uid),
        ...keyBy(newUsers, u => u.uid),
      },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USERS_BY_ORGANIZATION_FAILURE', () => {
    const organizationId = 'Organization_001';
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = {
      type: types.USERS_BY_ORGANIZATION_FAILURE,
      error,
      organizationId,
    };

    const stateBefore = { byId: {}, error: null, loading: true };
    const stateAfter = {
      byId: {},
      error: action.error,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it(
    'handles USERS_BY_ORGANIZATION_FAILURE, ' +
      'existing users, new organizationId',
    () => {
      const users = [
        {
          uid: 'User_001',
          name: 'User One',
          owned_organizations: ['Organization_001'],
        },
        {
          uid: 'User_002',
          name: 'User Two',
          owned_organizations: ['Organization_001'],
        },
        {
          uid: 'User_003',
          name: 'User Three',
          owned_organizations: ['Organization_002'],
        },
        {
          uid: 'User_004',
          name: 'User Four',
          owned_organizations: ['Organization_002'],
        },
        {
          uid: 'User_005',
          name: 'User Five',
          owned_organizations: ['Organization_003'],
        },
      ];
      const organizationId = 'Organization_005';
      const error = {
        code: 'server/403',
        message: 'Not authorized to access this resource.',
      };
      const action = {
        type: types.USERS_BY_ORGANIZATION_FAILURE,
        error,
        organizationId,
      };

      const stateBefore = {
        byId: keyBy(users, u => u.uid),
        error: null,
        loading: true,
      };
      const stateAfter = {
        byId: pickBy(
          keyBy(users, u => u.uid),
          u => !u.owned_organizations.includes(action.organizationId),
        ),
        error: action.error,
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    },
  );

  it(
    'handles USERS_BY_ORGANIZATION_FAILURE, ' +
      'existing users, existing organizationId',
    () => {
      const users = [
        {
          uid: 'User_001',
          name: 'User One',
          owned_organizations: ['Organization_001'],
        },
        {
          uid: 'User_002',
          name: 'User Two',
          owned_organizations: ['Organization_001'],
        },
        {
          uid: 'User_003',
          name: 'User Three',
          owned_organizations: ['Organization_002'],
        },
        {
          uid: 'User_004',
          name: 'User Four',
          owned_organizations: ['Organization_002'],
        },
        {
          uid: 'User_005',
          name: 'User Five',
          owned_organizations: ['Organization_003'],
        },
      ];
      const organizationId = 'Organization_002';
      const error = {
        code: 'server/403',
        message: 'Not authorized to access this resource.',
      };
      const action = {
        type: types.USERS_BY_ORGANIZATION_FAILURE,
        error,
        organizationId,
      };

      const stateBefore = {
        byId: keyBy(users, u => u.uid),
        error: null,
        loading: true,
      };
      const stateAfter = {
        byId: pickBy(
          keyBy(users, u => u.uid),
          u => !u.owned_organizations.includes(action.organizationId),
        ),
        error: action.error,
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    },
  );
  // Get a User
  it('handles USER_REQUEST', () => {
    const action = { type: types.USER_REQUEST, uid: 'User_Test123' };
    const stateBefore = { byId: null, error: null, loading: null };
    const stateAfter = { byId: null, error: null, loading: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USER_SUCCESS', () => {
    const usersById = {
      User_00001: { uid: 'User_00001', name: 'Tron' },
      User_00002: { uid: 'User_00002', name: 'Clu' },
    };

    const user = {
      uid: 'User_Test123',
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const action = { type: types.USER_SUCCESS, user };
    const stateBefore = { byId: usersById, error: null, loading: true };
    const stateAfter = {
      byId: { ...stateBefore.byId, ...keyBy(user, 'uid') },
      error: null,
      loading: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USER_FAILURE', () => {
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.USER_FAILURE, error };
    const stateBefore = { user: null, error: null, loading: true };
    const stateAfter = { user: null, error, loading: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Invite a User
  it('handles INVITE_USERS_REQUEST', () => {
    const user1 = { email: 'foo@bar.com' };
    const user2 = { email: 'baz@qux.com' };
    const action = {
      type: types.INVITE_USERS_REQUEST,
      invitees: [user1, user2],
    };
    const stateBefore = { user: null, error: null, inviting: null };
    const stateAfter = {
      user: null,
      error: null,
      inviting: true,
      inviteesByEmail: {
        [user1.email]: user1,
        [user2.email]: user2,
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles INVITE_USERS_SUCCESS', () => {
    const user1 = { email: 'foo@bar.com' };
    const action = { type: types.INVITE_USERS_SUCCESS };
    const stateBefore = {
      user: null,
      error: null,
      inviting: true,
      inviteesByEmail: { [user1.email]: user1 },
    };
    const stateAfter = {
      user: null,
      error: null,
      inviting: false,
      inviteesByEmail: {},
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles INVITE_USERS_FAILURE', () => {
    const user1 = { email: 'foo@bar.com' };
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.INVITE_USERS_FAILURE, error };
    const stateBefore = {
      user: null,
      error: null,
      inviting: true,
      inviteesByEmail: { [user1.email]: user1 },
    };
    const stateAfter = {
      user: null,
      error,
      inviting: false,
      inviteesByEmail: {},
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Stage Invitee
  it('handles STAGE_INVITEE', () => {
    const invitee = { name: 'Some Name', email: 'user@example.com' };
    const action = { type: types.STAGE_INVITEE, invitee };
    const stateBefore = { inviteesByEmail: {} };
    const stateAfter = {
      inviteesByEmail: {
        ...stateBefore.inviteesByEmail,
        ...keyBy(invitee, 'email'),
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UNSTAGE_INVITEES', () => {
    const email = 'user@example.com';
    const inviteesByEmail = [
      { name: 'Some Name', email },
      { name: 'Some Other Name', email: 'otherUser@example.com' },
    ];
    const action = { type: types.UNSTAGE_INVITEE, email };
    const stateBefore = { inviteesByEmail };
    const stateAfter = {
      inviteesByEmail: {
        ...stateBefore.inviteesByEmail,
        [email]: undefined,
      },
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UNSTAGE_INVITEES', () => {
    const inviteesByEmail = [{ name: 'Some Name', email: 'user@example.com' }];
    const action = { type: types.UNSTAGE_INVITEES };
    const stateBefore = { inviteesByEmail };
    const stateAfter = { inviteesByEmail: {} };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  // Update a User
  it('handles UPDATE_USER_REQUEST', () => {
    const action = { type: types.UPDATE_USER_REQUEST };
    const stateBefore = { user: null, error: null, updating: null };
    const stateAfter = { user: null, error: null, updating: true };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UPDATE_USER_SUCCESS', () => {
    const usersById = {
      User_00001: { uid: 'User_00001', name: 'Tron' },
      User_00002: { uid: 'User_00002', name: 'Clu' },
    };

    const user = {
      uid: 'User_00001',
      name: 'Aaron Admin',
      email: 'admin@perts.net',
    };
    const action = { type: types.UPDATE_USER_SUCCESS, user };
    const stateBefore = {
      byId: usersById,
      error: null,
      updating: true,
    };
    const stateAfter = {
      byId: {
        ...stateBefore.byId,
        ...keyBy(action.user, 'uid'),
      },
      error: null,
      updating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UPDATE_USER_FAILURE', () => {
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.UPDATE_USER_FAILURE, error };
    const stateBefore = { user: null, error: null, updating: true };
    const stateAfter = { user: null, error, updating: false };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UPDATE_USERS_REQUEST', () => {
    const action = { type: types.UPDATE_USERS_REQUEST };

    const stateBefore = {
      ...initialState,
      updating: false,
    };
    const stateAfter = {
      ...stateBefore,
      updating: true,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UPDATE_USERS_SUCCESS', () => {
    const users = [
      { uid: 'User_001', name: 'User One', owned_teams: ['Team_001'] },
      { uid: 'User_002', name: 'User Two', owned_teams: ['Team_001'] },
      { uid: 'User_003', name: 'User Three', owned_teams: ['Team_001'] },
      { uid: 'User_004', name: 'User Four', owned_teams: ['Team_001'] },
      { uid: 'User_005', name: 'User Five', owned_teams: ['Team_001'] },
    ];
    const action = { type: types.UPDATE_USERS_SUCCESS, users };

    const stateBefore = {
      ...initialState,
      byId: {},
      updating: true,
    };
    const stateAfter = {
      ...stateBefore,
      byId: {
        ...stateBefore.byId,
        ...keyBy(action.users, u => u.uid),
      },
      updating: false,
    };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles UPDATE_USERS_FAILURE', () => {
    const error = {
      code: 'server/403',
      message: 'Not authorized to access this resource.',
    };
    const action = { type: types.UPDATE_USERS_FAILURE, error };

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

  // User Mode
  it('handles USER_MODE_SET', () => {
    const mode = 'some mode';
    const action = { type: types.USER_MODE_SET, mode };
    const stateBefore = { ...initialState, userMode: '' };
    const stateAfter = { ...stateBefore, userMode: mode };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('handles USER_MODE_RESET', () => {
    const mode = 'some mode';
    const action = { type: types.USER_MODE_RESET, mode };
    const stateBefore = { ...initialState, userMode: mode };
    const stateAfter = { ...stateBefore, userMode: '' };

    deepFreeze(stateBefore);
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
