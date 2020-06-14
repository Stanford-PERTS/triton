import selectors from 'state/selectors';

import initialState from './initialState';

const team1 = {
  uid: 'Team_001',
};

const classroom1 = {
  uid: 'Classroom_001',
  team_id: team1.uid,
  num_students: 10,
};

const cycle1 = {
  uid: 'Cycle_001',
  short_uid: '001',
  team_id: team1.uid,
};

const state = {
  ...initialState,
  entities: {
    classrooms: {
      byId: {
        [classroom1.uid]: classroom1,
      },
    },
    cycles: {
      byId: {
        [cycle1.uid]: cycle1,
      },
      classroomParticipationById: {
        [cycle1.uid]: {
          [classroom1.uid]: [
            {
              survey_ordinal: null,
              value: '100',
              n: 1,
            },
            {
              survey_ordinal: null,
              value: '33',
              n: 1,
            },
          ],
        },
      },
    },
    teams: {
      byId: {
        [team1.uid]: team1,
      },
    },
  },
};

// @todo: make this a utility function to make it easier to mock
// route-based params.
const props = {
  match: {
    params: {
      teamId: team1.uid,
      parentLabel: cycle1.short_uid,
    },
  },
};

describe('cycle selectors', () => {
  it('selects participant data for a cycle', () => {
    const actual = selectors.cycle.participationByClassroom(state, props);

    const expected = {
      [classroom1.uid]:
        state.entities.cycles.classroomParticipationById[cycle1.uid][
          classroom1.uid
        ],
    };

    expect(actual).toEqual(expected);
  });

  it('select percent of expected students completed', () => {
    const actual = selectors.cycle.participationPercentDerived(state, props);
    const expected = 10;

    expect(actual).toEqual(expected);
  });
});
