import * as selectors from './selectors';
import deepFreeze from 'deep-freeze';
import groupBy from 'utils/groupBy';
import _values from 'lodash/values';

import initialState from './initialState';

const classroomsById = {
  Classroom_001: {
    uid: 'Classroom_001',
    name: 'Classroom One',
    team_id: 'Team_001',
  },
  Classroom_002: {
    uid: 'Classroom_002',
    name: 'Classroom Two',
    team_id: 'Team_001',
  },
  Classroom_003: {
    uid: 'Classroom_003',
    name: 'Classroom Three',
    team_id: 'Team_001',
  },
  Classroom_004: {
    uid: 'Classroom_004',
    name: 'Classroom Four',
    team_id: 'Team_002',
  },
  Classroom_005: {
    uid: 'Classroom_005',
    name: 'Classroom Five',
    team_id: 'Team_002',
  },
};

describe('classrooms selectors', () => {
  it('should get classrooms', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };

    const expected = _values(classroomsById);
    const actual = selectors.getClassrooms(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classroomMode', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      classroomMode: 'update',
    };

    const expected = state.classroomMode;
    const actual = selectors.classroomsMode(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get redirect', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      redirect: 'some/path',
    };
    const expected = state.redirect;
    const actual = selectors.classroomsRedirect(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get loading', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      loading: true,
    };

    const expected = state.loading;
    const actual = selectors.classroomsLoading(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get adding', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      adding: true,
    };

    const expected = state.adding;
    const actual = selectors.classroomsAdding(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get deleting', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      deleting: true,
    };

    const expected = state.deleting;
    const actual = selectors.classroomsDeleting(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get updating', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      updating: true,
    };

    const expected = state.updating;
    const actual = selectors.classroomsUpdating(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get error', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
      error: 'some error',
    };

    const expected = state.error;
    const actual = selectors.classroomsError(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classroom names', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };
    const classrooms = selectors.getClassrooms(state);

    const expected = classrooms.map(c => c.name);
    const actual = selectors.getClassroomNames(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classroom contacts', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };
    const classrooms = selectors.getClassrooms(state);

    const expected = classrooms.map(c => c.contact_id);
    const actual = selectors.getClassroomContacts(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classroom ids', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };

    const expected = Object.keys(state.byId);
    const actual = selectors.getClassroomIds(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classrooms by id', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };

    const expected = state.byId;
    const actual = selectors.classroomsById(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classrooms by teamId', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };
    const classrooms = selectors.getClassrooms(state);

    const expected = groupBy(classrooms, 'team_id');
    const actual = selectors.getClassroomsByTeamId(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get classrooms by contactId', () => {
    const state = {
      ...initialState,
      byId: classroomsById,
    };
    const classrooms = selectors.getClassrooms(state);

    const expected = groupBy(classrooms, 'contact_id');
    const actual = selectors.getClassroomsByContactId(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });
});
