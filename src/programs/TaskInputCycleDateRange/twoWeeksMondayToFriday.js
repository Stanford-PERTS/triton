import moment from 'moment/moment';

import { getPreviousWeekday, getNextWeekday } from 'utils/date';

/**
 * Attempts to find reasonable default dates for a cycle based on the other
 * cycles around it. English rules are:
 *
 * > By default, start date will be today or the first Monday after the last day
 * of the previous cycle. (Whichever is later.) End date will be 2 weeks later
 * or the Friday before the next cycle starts. (Whichever is earlier.) If it is
 * impossible to set defaults because of date conflicts, don't set them.
 *
 * CM has also added the rule that if the previous cycle exists but has dates
 * unset, then this doesn't attempt to provide dates, with the intent that you
 * should schedule cycles linearly (not skipping some).
 *
 * @param  {CycleEntity}   cycle  for which we'd like to find dates
 * @param  {CycleEntity[]} cycles other cycles for the team
 * @return {Object}        like {startDate?: moment, endDate?: moment}
 */
const twoWeeksMondayToFriday = (cycle, cycles) => {
  if (cycle.start_date || cycle.end_date) {
    // Don't attempt to override any already-set dates.
    return {};
  }

  const previousCycle = cycles.find(c => c.ordinal === cycle.ordinal - 1);
  const nextCycle = cycles.find(c => c.ordinal === cycle.ordinal + 1);

  if (previousCycle && !previousCycle.end_date) {
    // Don't provide dates when skipping over previous cycles. We don't want
    // a situation where there's no room on the calendar to schedule an
    // intervening cycle if people click ahead.
    return {};
  }

  const today = moment();
  let startDate = today;
  if (previousCycle && previousCycle.end_date) {
    startDate = moment.max(today, getNextWeekday(1, previousCycle.end_date));
  }

  const twoWeeksLater = startDate.clone().add(2, 'week');
  let endDate = twoWeeksLater;
  if (nextCycle && nextCycle.start_date) {
    endDate = moment.min(
      twoWeeksLater,
      getPreviousWeekday(5, nextCycle.start_date),
    );
  }

  if (startDate > endDate) {
    // No obvious choice for dates to pick, do nothing.
    return {};
  }

  return { startDate, endDate };
};

export default twoWeeksMondayToFriday;
