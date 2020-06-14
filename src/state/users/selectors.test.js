import * as selectors from './selectors';
import deepFreeze from 'deep-freeze';
import keyBy from 'utils/keyBy';
import _union from 'lodash/union';
import _values from 'lodash/values';

import initialState from './initialState';

const userOne = {
  uid: 'User_001',
  name: 'User One',
  owned_teams: ['Team_001'],
};
const userTwo = {
  uid: 'User_002',
  name: 'User Two',
  owned_teams: ['Team_001', 'Team_002'],
};
const userThree = {
  uid: 'User_003',
  name: 'User Three',
  owned_teams: ['Team_001', 'Team_002'],
};
const userFour = {
  uid: 'User_004',
  name: 'User Four',
  owned_teams: ['Team_002'],
};
const userFive = {
  uid: 'User_005',
  name: 'User Five',
  owned_teams: ['Team_002'],
};

const usersById = {
  User_001: userOne,
  User_002: userTwo,
  User_003: userThree,
  User_004: userFour,
  User_005: userFive,
};

const inviteesByEmail = {
  'user1@example.com': { name: 'User One', email: 'user1@example.com' },
  'user2@example.com': { name: 'User Two', email: 'user2@example.com' },
};

describe('users selectors', () => {
  it('should get users by id', () => {
    const state = {
      ...initialState,
      usersById,
    };

    const expected = state.usersById;
    const actual = selectors.usersById(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get users by team id', () => {
    const state = {
      ...initialState,
      usersById,
    };

    const users = selectors.getUsers(state);
    const expected = {};
    _union(...users.map(u => u.owned_teams)).forEach(teamId => {
      expected[teamId] = users.filter(u => u.owned_teams.includes(teamId));
    });
    const actual = selectors.getUsersByTeamId(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get users by organization id', () => {
    const state = {
      ...initialState,
      usersById,
    };

    const users = selectors.getUsers(state);
    const expected = {};
    _union(...users.map(u => u.owned_organizations)).forEach(organizationId => {
      expected[organizationId] = users.filter(u =>
        u.owned_organizations.includes(organizationId),
      );
    });
    const actual = selectors.getUsersByOrganizationId(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get invitees by email', () => {
    const state = {
      ...initialState,
      inviteesByEmail,
    };

    const expected = state.inviteesByEmail;
    const actual = selectors.inviteesByEmail(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get users', () => {
    const state = {
      ...initialState,
      usersById,
    };

    const expected = _values(usersById);
    const actual = selectors.getUsers(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get invitees', () => {
    const state = {
      ...initialState,
      inviteesByEmail,
    };

    const expected = _values(inviteesByEmail);
    const actual = selectors.getInvitees(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get userMode', () => {
    const state = {
      ...initialState,
      usersById,
      userMode: 'update',
    };

    const expected = state.userMode;
    const actual = selectors.usersMode(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get redirect', () => {
    const state = {
      ...initialState,
      usersById,
      redirect: 'some/path',
    };
    const expected = state.redirect;
    const actual = selectors.usersRedirect(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get loading', () => {
    const state = {
      ...initialState,
      usersById,
      loading: true,
    };

    const expected = state.loading;
    const actual = selectors.usersLoading(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get inviting', () => {
    const state = {
      ...initialState,
      usersById,
      inviting: true,
    };

    const expected = state.inviting;
    const actual = selectors.usersInviting(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get verifying', () => {
    const state = {
      ...initialState,
      usersById,
      verifying: true,
    };

    const expected = state.verifying;
    const actual = selectors.usersVerifying(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get error', () => {
    const state = {
      ...initialState,
      usersById,
      error: 'some error',
    };

    const expected = state.error;
    const actual = selectors.usersError(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get user names', () => {
    const state = {
      ...initialState,
      usersById,
    };
    const users = selectors.getUsers(state);

    const expected = users.map(c => c.name);
    const actual = selectors.getUserNames(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get user ids', () => {
    const state = {
      ...initialState,
      usersById,
    };

    const expected = Object.keys(state.usersById);
    const actual = selectors.getUserIds(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get users by id', () => {
    const state = {
      ...initialState,
      usersById,
    };

    const expected = state.usersById;
    const actual = selectors.usersById(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get users by email', () => {
    const state = {
      ...initialState,
      usersById,
    };
    const users = selectors.getUsers(state);

    const expected = keyBy(users, 'email');
    const actual = selectors.getUsersByEmail(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });
});
