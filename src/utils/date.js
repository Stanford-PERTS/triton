import moment from 'moment/moment';

export const getNextWeekday = (weekdayInt, relativeTo = moment()) => {
  if (weekdayInt < 0 || 6 < weekdayInt || typeof weekdayInt !== 'number') {
    throw new Error(`weekday integer must be in [0, 6], got ${weekdayInt}`);
  }
  // https://momentjs.com/docs/#/get-set/day/
  // The day from this week, e.g. "this monday", NOT "this coming monday", i.e.
  // does not cross weeks. Docs say "the resulting date will be within the
  // current (Sunday-to-Saturday) week."
  const thisDay = relativeTo.clone().day(weekdayInt);
  // One week after.
  const nextDay = relativeTo.clone().day(weekdayInt + 7);

  return thisDay.isAfter(relativeTo) ? thisDay : nextDay;
};

export const getPreviousWeekday = (weekdayInt, relativeTo = moment()) => {
  if (weekdayInt < 0 || 6 < weekdayInt || typeof weekdayInt !== 'number') {
    throw new Error(`weekday integer must be in [0, 6], got ${weekdayInt}`);
  }
  // https://momentjs.com/docs/#/get-set/day/
  const thisDay = relativeTo.clone().day(weekdayInt);
  const previousDay = relativeTo.clone().day(weekdayInt - 7);
  return thisDay.isBefore(relativeTo) ? thisDay : previousDay;
};
