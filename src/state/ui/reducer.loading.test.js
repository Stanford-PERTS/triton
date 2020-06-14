import deepFreeze from 'deep-freeze';

import initialState from './initialState';
import reducer from './reducer.loading';
import getLoadingKey from './getLoadingKey';
import { actionMethodsFlags } from 'state/actionTypes';

describe('ui loading reducer', () => {
  describe('init and default', () => {
    it('should return the initial state', () => {
      expect(reducer(undefined, {})).toEqual(initialState.loading);
    });

    it('should return state when no relevant action types present', () => {
      const action = { type: 'ANOTHER_ACTION_TYPE' };
      const stateBefore = initialState.loading;
      const stateAfter = stateBefore;
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });

  describe('slices level', () => {
    describe('loading', () => {
      it('should set', () => {
        const action1 = {
          actionSlice: 'TEAMS',
          actionMethod: 'QUERY',
          actionStage: 'REQUEST',
        };
        const action2 = {
          actionSlice: 'USERS',
          actionMethod: 'QUERY',
          actionStage: 'REQUEST',
        };
        const action3 = {
          actionSlice: 'CYCLES',
          actionMethod: 'QUERY',
          actionOptions: 'BY_TEAM',
          actionStage: 'REQUEST',
          teamId: 'Team_001',
        };

        const stateBefore = initialState.loading;
        const stateAfter = {
          ...stateBefore,
          // this is the change we care about for this test
          slices: {
            ...stateBefore.slices,
            CYCLES: actionMethodsFlags.QUERY,
            TEAMS: actionMethodsFlags.QUERY,
            USERS: actionMethodsFlags.QUERY,
          },
          // the parent level will also unflag as loading
          parents: {
            ...stateBefore.parents,
            [action3.teamId]: {
              CYCLES: true,
            },
          },
        };

        deepFreeze(stateBefore);

        expect(
          [action1, action2, action3].reduce(
            (currentState, action) => reducer(currentState, action),
            stateBefore,
          ),
        ).toEqual(stateAfter);
      });

      it('should unset', () => {
        const action1 = {
          actionSlice: 'TEAMS',
          actionMethod: 'QUERY',
          actionStage: 'SUCCESS',
        };
        const action2 = {
          actionSlice: 'USERS',
          actionMethod: 'QUERY',
          actionStage: 'SUCCESS',
        };
        const action3 = {
          actionSlice: 'CYCLES',
          actionMethod: 'QUERY',
          actionOptions: 'BY_TEAM',
          actionStage: 'FAILURE',
          teamId: 'Team_001',
        };

        const stateBefore = {
          ...initialState.loading,
          slices: {
            ...initialState.loading.slices,
            CYCLES: actionMethodsFlags.QUERY,
            TEAMS: actionMethodsFlags.QUERY,
            USERS: actionMethodsFlags.QUERY,
          },
        };
        const stateAfter = {
          ...stateBefore,
          // this is the change we care about for this test
          slices: {
            ...stateBefore.slices,
            CYCLES: undefined,
            TEAMS: undefined,
            USERS: undefined,
          },
          // the parent level will also unflag as loading
          parents: {
            ...stateBefore.parents,
            [action3.teamId]: {
              CYCLES: undefined,
            },
          },
        };

        deepFreeze(stateBefore);

        expect(
          [action1, action2, action3].reduce(
            (currentState, action) => reducer(currentState, action),
            stateBefore,
          ),
        ).toEqual(stateAfter);
      });
    });

    describe('adding', () => {
      it('should set', () => {
        const action1 = {
          actionSlice: 'TEAMS',
          actionMethod: 'ADD',
          actionStage: 'REQUEST',
        };
        const action2 = {
          actionSlice: 'USERS',
          actionMethod: 'ADD',
          actionStage: 'REQUEST',
        };
        const action3 = {
          actionSlice: 'CYCLES',
          actionMethod: 'ADD',
          actionStage: 'REQUEST',
        };

        const stateBefore = initialState.loading;
        const stateAfter = {
          ...stateBefore,
          slices: {
            ...stateBefore.slice,
            CYCLES: actionMethodsFlags.ADD,
            TEAMS: actionMethodsFlags.ADD,
            USERS: actionMethodsFlags.ADD,
          },
        };

        deepFreeze(stateBefore);

        expect(
          [action1, action2, action3].reduce(
            (currentState, action) => reducer(currentState, action),
            stateBefore,
          ),
        ).toEqual(stateAfter);
      });
    });

    describe('adding', () => {
      it('should unset', () => {
        const action1 = {
          actionSlice: 'TEAMS',
          actionMethod: 'ADD',
          actionStage: 'SUCCESS',
        };
        const action2 = {
          actionSlice: 'USERS',
          actionMethod: 'ADD',
          actionStage: 'SUCCESS',
        };
        const action3 = {
          actionSlice: 'CYCLES',
          actionMethod: 'ADD',
          actionStage: 'FAILURE',
        };

        const stateBefore = {
          ...initialState.loading,
          slices: {
            ...initialState.slices,
            CYCLES: actionMethodsFlags.ADD,
            TEAMS: actionMethodsFlags.ADD,
            USERS: actionMethodsFlags.ADD,
          },
        };
        const stateAfter = {
          ...stateBefore,
          slices: {
            ...stateBefore.slices,
            CYCLES: undefined,
            TEAMS: undefined,
            USERS: undefined,
          },
        };

        deepFreeze(stateBefore);

        expect(
          [action1, action2, action3].reduce(
            (currentState, action) => reducer(currentState, action),
            stateBefore,
          ),
        ).toEqual(stateAfter);
      });
    });
  });

  describe('hoa slices level', () => {
    describe('loading', () => {
      it('should set', () => {
        const action1 = {
          actionPrefix: 'HOA_FOO',
          actionSlice: 'TEAMS',
          actionMethod: 'QUERY',
          actionStage: 'REQUEST',
        };
        const action2 = {
          actionPrefix: 'HOA_BAR',
          actionSlice: 'USERS',
          actionMethod: 'QUERY',
          actionStage: 'REQUEST',
        };

        const stateBefore = initialState.loading;
        const stateAfter = {
          ...stateBefore,
          hoaSlices: {
            ...stateBefore.hoaSlices,
            [getLoadingKey(action1)]: actionMethodsFlags.QUERY,
            [getLoadingKey(action2)]: actionMethodsFlags.QUERY,
          },
          slices: {
            TEAMS: actionMethodsFlags.QUERY,
            USERS: actionMethodsFlags.QUERY,
          },
        };

        deepFreeze(stateBefore);

        expect(
          [action1, action2].reduce(
            (currentState, action) => reducer(currentState, action),
            stateBefore,
          ),
        ).toEqual(stateAfter);
      });

      it('should unset', () => {
        const action1 = {
          actionPrefix: 'HOA_FOO',
          actionSlice: 'TEAMS',
          actionMethod: 'QUERY',
          actionStage: 'SUCCESS',
        };
        const action2 = {
          actionPrefix: 'HOA_BAR',
          actionSlice: 'USERS',
          actionMethod: 'QUERY',
          actionStage: 'SUCCESS',
        };

        const stateBefore = {
          ...initialState.loading,
          hoaSlices: {
            ...initialState.loading.hoaSlices,
            [getLoadingKey(action1)]: actionMethodsFlags.QUERY,
            [getLoadingKey(action2)]: actionMethodsFlags.QUERY,
          },
          slices: {
            ...initialState.loading.slices,
            TEAMS: actionMethodsFlags.QUERY,
            USERS: actionMethodsFlags.QUERY,
          },
        };
        const stateAfter = {
          ...stateBefore,
          hoaSlices: {
            ...stateBefore.hoaSlices,
            [getLoadingKey(action1)]: undefined,
            [getLoadingKey(action2)]: undefined,
          },
          slices: {
            ...stateBefore.slices,
            TEAMS: undefined,
            USERS: undefined,
          },
        };

        deepFreeze(stateBefore);

        expect(
          [action1, action2].reduce(
            (currentState, action) => reducer(currentState, action),
            stateBefore,
          ),
        ).toEqual(stateAfter);
      });
    });
  });

  describe('parents level', () => {
    it('should set loading', () => {
      const action = {
        actionSlice: 'CLASSROOMS',
        actionOptions: 'BY_TEAM',
        actionMethod: 'QUERY',
        actionStage: 'REQUEST',
        teamId: 'Team_001',
      };

      const stateBefore = initialState.loading;
      const stateAfter = {
        ...stateBefore,
        // this is the change we care about for this test
        parents: {
          ...stateBefore.parents,
          [action.teamId]: {
            [action.actionSlice]: true,
          },
        },
        // the slice level will also flag as loading
        slices: {
          ...stateBefore.slices,
          [action.actionSlice]: actionMethodsFlags[action.actionMethod],
        },
      };

      deepFreeze(stateBefore);

      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should unset loading', () => {
      const action = {
        actionSlice: 'CLASSROOMS',
        actionOptions: 'BY_TEAM',
        actionMethod: 'QUERY',
        actionStage: 'SUCCESS',
        teamId: 'Team_001',
      };

      const stateBefore = {
        ...initialState.loading,
        // this is the change we care about for this test
        parents: {
          ...initialState.loading.parents,
          [action.teamId]: {
            [action.actionSlice]: true,
          },
        },
        // the slice level will also change
        slices: {
          ...initialState.loading.slices,
          [action.actionSlice]: actionMethodsFlags[action.actionType],
        },
      };
      const stateAfter = {
        ...stateBefore,
        // this is the change we care about for this test
        parents: {
          ...initialState.loading.parents,
          [action.teamId]: {
            [action.actionSlice]: undefined,
          },
        },
        // the slice level will also change
        slices: {
          ...initialState.loading.slices,
          [action.actionSlice]: undefined,
        },
      };

      deepFreeze(stateBefore);

      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });

  describe('entities level', () => {
    it('should set loading', () => {
      const action = {
        actionSlice: 'TEAMS',
        actionMethod: 'GET',
        actionStage: 'REQUEST',
        actionUids: ['TEAM_001', 'TEAM_002'],
      };

      const stateBefore = initialState.loading;
      const stateAfter = {
        ...stateBefore,
        entities: {
          ...stateBefore.entities,
          TEAM_001: actionMethodsFlags.GET,
          TEAM_002: actionMethodsFlags.GET,
        },
      };

      deepFreeze(stateBefore);

      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should set updating', () => {
      const action = {
        actionSlice: 'TEAMS',
        actionMethod: 'UPDATE',
        actionStage: 'REQUEST',
        actionUids: ['TEAM_001'],
      };

      const stateBefore = initialState.loading;
      const stateAfter = {
        ...stateBefore,
        entities: {
          ...stateBefore.entities,
          TEAM_001: actionMethodsFlags.UPDATE,
        },
      };

      deepFreeze(stateBefore);

      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should set deleting', () => {
      const action = {
        actionSlice: 'TEAMS',
        actionMethod: 'DELETE',
        actionStage: 'REQUEST',
        actionUids: ['TEAM_001'],
      };

      const stateBefore = initialState.loading;
      const stateAfter = {
        ...stateBefore,
        entities: {
          ...stateBefore.entities,
          TEAM_001: actionMethodsFlags.DELETE,
        },
      };

      deepFreeze(stateBefore);

      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should unset', () => {
      const action1 = {
        actionSlice: 'TEAMS',
        actionMethod: 'GET',
        actionStage: 'SUCCESS',
        actionUids: ['TEAM_001', 'TEAM_002'],
      };
      const action2 = {
        actionSlice: 'TEAMS',
        actionMethod: 'GET',
        actionStage: 'FAILURE',
        actionUids: ['TEAM_003'],
      };
      const action3 = {
        actionSlice: 'TEAMS',
        actionMethod: 'UPDATE',
        actionStage: 'FAILURE',
        actionUids: ['TEAM_004'],
      };
      const action4 = {
        actionSlice: 'TEAMS',
        actionMethod: 'UPDATE',
        actionStage: 'FAILURE',
        actionUids: ['TEAM_005'],
      };
      const action5 = {
        actionSlice: 'TEAMS',
        actionMethod: 'DELETE',
        actionStage: 'SUCCESS',
        actionUids: ['TEAM_006'],
      };
      const action6 = {
        actionSlice: 'TEAMS',
        actionMethod: 'DELETE',
        actionStage: 'FAILURE',
        actionUids: ['TEAM_007'],
      };

      const stateBefore = {
        ...initialState.loading,
        entities: {
          ...initialState.loading.entities,
          TEAM_001: actionMethodsFlags.GET,
          TEAM_002: actionMethodsFlags.GET,
          TEAM_003: actionMethodsFlags.GET,
          TEAM_004: actionMethodsFlags.UPDATE,
          TEAM_005: actionMethodsFlags.UPDATE,
          TEAM_006: actionMethodsFlags.DELETE,
          TEAM_007: actionMethodsFlags.DELETE,
          TEAM_008: actionMethodsFlags.GET,
        },
      };
      const stateAfter = {
        ...stateBefore,
        entities: {
          ...stateBefore.entities,
          TEAM_001: undefined,
          TEAM_002: undefined,
          TEAM_003: undefined,
          TEAM_004: undefined,
          TEAM_005: undefined,
          TEAM_006: undefined,
          TEAM_007: undefined,
        },
      };

      deepFreeze(stateBefore);

      expect(
        [action1, action2, action3, action4, action5, action6].reduce(
          (currentState, action) => reducer(currentState, action),
          stateBefore,
        ),
      ).toEqual(stateAfter);
    });
  });
});
