import moment from 'moment/moment';

import twoWeeksMondayToFriday from './twoWeeksMondayToFriday';

// defaulting to null b/c that's what the server returns
const makeCycle = (ordinal, start_date = null, end_date = null) => ({
  ordinal,
  start_date,
  end_date,
});

const expectDatesSame = (date1, date2) => {
  const isSame = date1.isSame(date2, 'day');
  if (!isSame) {
    console.error(date1, date2);
  }
  expect(isSame).toBe(true);
};

describe('twoWeeksMondayToFriday', () => {
  it('returns dates today and twoWeekslater', () => {
    const cycle = makeCycle(1);
    const cycles = [makeCycle(2), makeCycle(3)];

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, cycles);

    expectDatesSame(startDate, moment());
    expectDatesSame(endDate, moment().add(2, 'week'));
  });

  it('returns dates today and fridayBeforeNextCycle', () => {
    const cycle = makeCycle(1);
    // Next cycle is just over a week away. Too soon for choosing a two-week
    // long cycle. It should pick the latest Friday available.
    const cycles = [makeCycle(2, moment().add(10, 'day'))];

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, cycles);

    expectDatesSame(startDate, moment());
    expect(endDate.isBefore(cycles[0].start_date)).toBe(true);
    expect(endDate.day()).toBe(5); // Friday
  });

  it('returns dates mondayAfterPrevCycle and twoWeeksLater', () => {
    const cycle = makeCycle(2);
    // The end of the previous cycle is after today. It should choose the next
    // available Monday
    const cycles = [makeCycle(1, null, moment().add(1, 'day'))];

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, cycles);

    expect(startDate.isAfter(moment())).toBe(true);
    expect(startDate.day()).toBe(1); // Monday
    expectDatesSame(endDate, startDate.clone().add(2, 'week'));
  });

  it('returns dates mondayAfterPrevCycle and fridayBeforeNextCycle', () => {
    const cycle = makeCycle(2);
    const cycles = [
      // The end of the previous cycle is after today. It should choose the next
      // available Monday
      makeCycle(1, null, moment().add(1, 'day')),
      // Next cycle is less than two weeks later. Too soon for choosing a
      // two-week long cycle. It should pick the latest Friday available.
      makeCycle(3, moment().add(13, 'day')),
    ];

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, cycles);

    expect(startDate.isAfter(moment())).toBe(true);
    expect(startDate.day()).toBe(1); // Monday
    expect(endDate.isBefore(cycles[1].start_date)).toBe(true);
    expect(endDate.day()).toBe(5); // Friday
  });

  it('returns no dates if previous cycle exists but is unset', () => {
    const cycle = makeCycle(2);
    const cycles = [makeCycle(1)];

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, cycles);

    expect(startDate).toBe(undefined);
    expect(endDate).toBe(undefined);
  });

  it('returns no dates if dates are defined', () => {
    const cycle = makeCycle(1, moment(), moment().add(14, 'day'));

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, []);

    expect(startDate).toBe(undefined);
    expect(endDate).toBe(undefined);
  });

  it('returns no dates if start date is after end date', () => {
    const cycle = makeCycle(2);
    const cycles = [
      // The previous and next cycle are back-to-back, so there's no room
      // to schedule this one.
      makeCycle(1, null, moment()),
      makeCycle(3, moment().add(1, 'day')),
    ];

    const { startDate, endDate } = twoWeeksMondayToFriday(cycle, cycles);

    expect(startDate).toBe(undefined);
    expect(endDate).toBe(undefined);
  });
});
