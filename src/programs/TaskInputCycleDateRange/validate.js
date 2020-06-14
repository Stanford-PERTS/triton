import moment from 'moment';

export const cycleLengthErrorMessage = numWeekdaysRequired =>
  `Cycle should be at least ${Math.round(numWeekdaysRequired / 5)} ` +
  `week(s) (${numWeekdaysRequired} weekdays).`;
export const TEAM_MEETING_LOCATION_REQUIRED = 'Meeting location is required.';
export const TEAM_MEETING_LOCATION_LENGTH =
  'Meeting location must be 200 characters or less.';

const getWeekdayValidator = numWeekdaysRequired => values => {
  const errors = {};

  errors.cycle_dates = cycleDateErrors(numWeekdaysRequired, values);
  errors.meeting_location = meetingLocationErrors(values);

  return errors;
};

// Cycle Dates Validation
const cycleDateErrors = (numWeekDaysRequired, values) => {
  if (!values.cycle_dates) {
    return null;
  }

  const [start_date, end_date] = values.cycle_dates;

  // Since cycle_dates has multiple validations, and it's a little complicated,
  // let's display all the validation messages to help the user learn what makes
  // a valid cycle date range as quickly as possible.
  const errors = [];

  if (
    start_date &&
    end_date &&
    !isDateCycleLengthValid(numWeekDaysRequired, values)
  ) {
    errors.push(cycleLengthErrorMessage(numWeekDaysRequired));
  }

  return errors.length === 0 ? null : errors;
};

// Meeting Location Validation
const meetingLocationErrors = values => {
  if (values.meeting_location && values.meeting_location.length > 200) {
    return TEAM_MEETING_LOCATION_LENGTH;
  }

  return null;
};

const isDateCycleLengthValid = (numWeekDaysRequired, values) => {
  let numOfWeekdays = 0;

  const [start_date, end_date] = values.cycle_dates;

  // clone, so we don't manipulate start_date
  // https://momentjs.com/docs/#/parsing/moment-clone/
  let current_date = moment(start_date);

  while (current_date <= end_date) {
    if (
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(
        current_date.format('dddd'),
      )
    ) {
      numOfWeekdays += 1;
    }

    // https://momentjs.com/docs/#/manipulating/add/
    current_date = current_date.add(1, 'days');
  }

  return numOfWeekdays >= numWeekDaysRequired;
};

export default getWeekdayValidator;
