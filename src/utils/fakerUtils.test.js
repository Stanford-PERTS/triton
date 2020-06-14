import { generateCyclesForTeam } from './fakerUtils';

describe('generateCyclesForTeam', () => {
  it('generates cycles', () => {
    const teamId = 'Team_001';
    const cycles = generateCyclesForTeam({ uid: teamId });

    expect(cycles.length).toBeGreaterThan(1);

    // Should contain Date objects.
    // N.B. The faker will randomly choose not to generate dates for some
    // cycles after the first two, so this test would be flakey if you used
    // cycle 3 or greater.
    expect(cycles[0].start_date).toEqual(jasmine.any(Date));
    expect(cycles[0].end_date).toEqual(jasmine.any(Date));
    expect(cycles[1].start_date).toEqual(jasmine.any(Date));
    expect(cycles[1].end_date).toEqual(jasmine.any(Date));

    // Should end after they begin
    expect(Number(cycles[0].start_date)).toBeLessThan(
      Number(cycles[0].end_date),
    );

    // Should not overlap
    expect(Number(cycles[0].end_date)).toBeLessThan(
      Number(cycles[1].start_date),
    );

    // Should be ordered
    expect(cycles[0].ordinal).toEqual(1);
    expect(cycles[1].ordinal).toEqual(2);

    // Should have team id
    expect(cycles[0].team_id).toEqual(teamId);
  });
});
