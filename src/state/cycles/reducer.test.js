import * as actionTypes from './actionTypes';
import { cyclesById } from './reducer';

const cycle1 = {
  uid: 'Cycle_001',
  ordinal: 1,
};
const cycle2 = {
  uid: 'Cycle_002',
  ordinal: 2,
};
const cycle3 = {
  uid: 'Cycle_003',
  ordinal: 3,
};

const state = {
  byId: {
    [cycle1.uid]: cycle1,
    [cycle2.uid]: cycle2,
    [cycle3.uid]: cycle3,
  },
};

describe('cycle reducer', () => {
  it('updates multiple siblings (as if a cycle has been deleted)', () => {
    // As if cycle 1 has been deleted.
    const action = {
      type: actionTypes.CYCLES_BY_TEAM_SUCCESS,
      cycles: [
        {
          ...cycle2,
          ordinal: 1,
        },
        {
          ...cycle3,
          ordinal: 2,
        },
      ],
    };

    const newState = cyclesById(state.byId, action);

    expect(newState[cycle2.uid].ordinal).toBe(1);
    expect(newState[cycle3.uid].ordinal).toBe(2);

    // Cycle 1 is unchanged.
    expect(newState[cycle1.uid].ordinal).toBe(1);
  });

  it('removes cycles', () => {
    const action = {
      type: actionTypes.CYCLE_REMOVE_SUCCESS,
      cycle: cycle1,
    };

    const newState = cyclesById(state.byId, action);

    expect(newState[cycle1.uid]).not.toBeDefined();
  });
});
