import moment from 'moment';
import uri from 'urijs';

import {
  NEPTUNE_URL_PREFIX,
  fetchApi,
  fetchOptionsGET,
  getSpecialJwt,
} from './config';
import { TEAM_CLASSROOMS_PARTICIPATION_JWT } from './teams';

/**
 * [
 *   {
 *     survey_ordinal: 1,
 *     value: '100',
 *     participant_id: 'Participant_123',
 *   },
 *   ...
 * ]
 */

export const queryByClassroom = (
  classroom = {},
  startDate = false,
  endDate = false,
) => {
  const urlCode = classroom.code.replace(/ /g, '-');
  const url = uri(
    `${NEPTUNE_URL_PREFIX}/api/project_cohorts/${urlCode}/completion`,
  );

  if (startDate) {
    url.addSearch({
      start: moment(startDate)
        // beginning of day
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .utc()
        .format(),
    });
  }

  if (endDate) {
    url.addSearch({
      end: moment(endDate)
        // end of day
        .hour(23)
        .minute(59)
        .second(59)
        .millisecond(999)
        .utc()
        .format(),
    });
  }

  const options = fetchOptionsGET();

  // To allow this request on Neptune, which knows nothing about team/class
  // permission, use the specialized jwt from when we retrived the team.
  const special = getSpecialJwt(TEAM_CLASSROOMS_PARTICIPATION_JWT);
  options.headers.Authorization = `Bearer ${special}`;

  return fetchApi(url, options).catch(error => {
    console.error(
      'Neptune responded with an error status; continuing with no ' +
        'participation data.',
      error,
    );
    return {};
  });
};
