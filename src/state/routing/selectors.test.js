import * as selectors from './selectors';

const mockProps = params => ({
  match: {
    params,
  },
});

describe('routing selectors', () => {
  it('should get route team id', () => {
    const teamId = 'Team_001';
    const props = mockProps({ teamId });

    const expected = teamId;
    const actual = selectors.routeTeamId(undefined, props);

    expect(actual).toEqual(expected);
  });

  it('should get route classroom id', () => {
    const classroomId = 'Classroom_001';
    const props = mockProps({ classroomId });

    const expected = classroomId;
    const actual = selectors.routeClassroomId(undefined, props);

    expect(actual).toEqual(expected);
  });

  it('should get route organization id', () => {
    const organizationId = 'Classroom_001';
    const props = mockProps({ organizationId });

    const expected = organizationId;
    const actual = selectors.routeOrganizationId(undefined, props);

    expect(actual).toEqual(expected);
  });

  it('should get route user id', () => {
    const userId = 'User_001';
    const props = mockProps({ userId });

    const expected = userId;
    const actual = selectors.routeUserId(undefined, props);

    expect(actual).toEqual(expected);
  });
});
