// Returns true if provided date is before today.

import moment from 'moment';

const isOverdue = dueDate => {
  const beginningOfToday = { hour: 0, minute: 0, seconds: 0, milliseconds: 0 };
  return moment(beginningOfToday).isAfter(dueDate);
};

export default isOverdue;
