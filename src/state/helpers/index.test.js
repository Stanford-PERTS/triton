import groupBy from 'utils/groupBy';
import keyBy from 'utils/keyBy';
import _keyBy from 'lodash/keyBy';
import _groupBy from 'lodash/groupBy';

describe('keyBy helper function', () => {
  it('should transform arrays using _.keyBy', () => {
    const metrics = [
      {
        uid: 'Metric_001',
        name: 'Community of Helpers',
      },
      {
        uid: 'Metric_002',
        name: 'Feedback for Growth',
      },
      {
        uid: 'Metric_003',
        name: 'Value of Learning',
      },
      {
        uid: 'Metric_004',
        name: 'Relationship with Adults',
      },
    ];
    const transform = e => e.uid; // index by entity uid
    const expectedOutput = _keyBy(metrics, transform);

    expect(keyBy(metrics, transform)).toEqual(expectedOutput);
  });

  it('should transform objects using _.keyBy', () => {
    const metric = {
      uid: 'Metric_003',
      name: 'Value of Learning',
    };

    const transform = e => e.uid; // index by entity uid
    const expectedOutput = _keyBy([metric], transform);

    expect(keyBy(metric, transform)).toEqual(expectedOutput);
  });
});

describe('groupBy helper function', () => {
  it('should transform arrays using _.groupBy', () => {
    const classrooms = [
      {
        uid: 'Classroom_001',
        name: 'Classroom 1',
        teamId: 'Team_001',
      },
      {
        uid: 'Classroom_002',
        name: 'Classroom 2',
        teamId: 'Team_001',
      },
      {
        uid: 'Classroom_003',
        name: 'Classroom 3',
        teamId: 'Team_002',
      },
      {
        uid: 'Classroom_004',
        name: 'Classroom 4',
        teamId: 'Team_002',
      },
    ];
    const transform = e => e.teamId; // index by entity uid
    const expectedOutput = _groupBy(classrooms, transform);

    expect(groupBy(classrooms, transform)).toEqual(expectedOutput);
  });

  it('should transform objects using _.groupBy', () => {
    const classroom = {
      uid: 'Classroom_003',
      name: 'Classroom 3',
      teamId: 'Team_001',
    };

    const transform = e => e.teamId; // index by entity uid
    const expectedOutput = _groupBy([classroom], transform);

    expect(groupBy(classroom, transform)).toEqual(expectedOutput);
  });
});
