import moment from 'moment/moment';

import getWeekdayValidator from './validate';

describe('TaskInputCycleDateRange getWeekdayValidator', () => {
  it('returns success for valid cycle_dates', () => {
    // The date range picker will return an array of two dates for the field,
    // and the validator accepts form values, so expect the data to look like
    // this, where someone has chosen today, and a date 6 days later.
    const values = {
      cycle_dates: [moment(), moment().add(6, 'day')],
    };

    const actual = getWeekdayValidator(5)(values);
    expect(actual.cycle_dates).toBeNull();
  });

  it('returns error for cycles dates that are too short', () => {
    const values = {
      cycle_dates: [moment(), moment().add(6, 'day')],
    };

    const actual = getWeekdayValidator(10)(values);
    expect(actual.cycle_dates.length).toBe(1);
    expect(actual.cycle_dates[0]).toContain('2 week(s)');
    expect(actual.cycle_dates[0]).toContain('10 weekdays');
  });
});
