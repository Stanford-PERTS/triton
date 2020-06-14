import fromParams from './fromParams';

describe('fromParams', () => {
  it('should convert shortUids to uids', () => {
    const props = {
      match: {
        params: {
          teamId: '1a0f71db2372',
          classroomId: '00058a3bc0d8',
        },
      },
    };
    const converted = {
      teamId: 'Team_1a0f71db2372',
      classroomId: 'Classroom_00058a3bc0d8',
    };

    expect(fromParams(props)).toEqual(converted);
  });

  it('should handle params with uids', () => {
    const props = {
      match: {
        params: {
          teamId: 'Team_1a0f71db2372',
          classroomId: 'Classroom_00058a3bc0d8',
        },
      },
    };
    const converted = {
      teamId: 'Team_1a0f71db2372',
      classroomId: 'Classroom_00058a3bc0d8',
    };

    expect(fromParams(props)).toEqual(converted);
  });

  it('should handle params that are not Ids', () => {
    const props = {
      match: {
        params: {
          foo: '12345',
          bar: '78901',
        },
      },
    };
    const converted = {
      foo: '12345',
      bar: '78901',
    };

    expect(fromParams(props)).toEqual(converted);
  });
});
