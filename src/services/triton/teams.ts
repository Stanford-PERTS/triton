import uri from 'urijs';

import Entity from 'services/Entity';
import {
  NEPTUNE_URL_PREFIX,
  TRITON_URL_PREFIX,
  captureSpecialJwt,
  fetchApi,
  getAuthorization,
  getLinkHeader,
  handleApiResponse,
} from './config';

import { queryByTeam as getSurveyByTeam } from 'services/triton/surveys';

export interface TeamEntity extends Entity {
  name: string;
  captain_id: string;
  organization_ids: string[];
  program_id: string;
  survey_reminders: boolean;
  report_reminders: boolean;
  target_group_name: string;
  num_users: number;
  num_classrooms: number;
  participation_base: number;
}

export const TEAM_CLASSROOMS_PARTICIPATION_JWT = 'teamClassroomsParticipation';

export const getDefaultTeam = ({
  uid = '',
  captain_id = '',
  name = '',
  report_reminders = true,
  survey_reminders = true,
} = {}) => ({
  uid,
  captain_id,
  name,
  report_reminders,
  survey_reminders,
});

export const teamParams = Object.keys(getDefaultTeam());

/**
 * List all (for supers) or one's own teams.
 * @param {string} userUid for the user making the query.
 * @param {boolean} isAdmin true if user type is 'super_admin', triggers global
 *   search.
 * @param {Object} queryOptions with optional props `n` and `cursor` for
 *   limiting/paging results.
 * @returns {Object} promise from fetch.
 */
export const query = (userUid, isAdmin, queryOptions: any = {}) => {
  if (isAdmin) {
    // Super admins, who query /api/teams, should have their results paged by
    // default, because the result set is so big.
    queryOptions.n = queryOptions.n || 10;
  } // normal users, who query /api/users/X/teams, should have no limit/paging

  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const path = isAdmin
    ? `${TRITON_URL_PREFIX}/api/teams`
    : `${TRITON_URL_PREFIX}/api/users/${userUid}/teams`;
  const url = uri(path).search(queryOptions);

  const fetchPromise = fetch(url, options);
  const linkPromise = fetchPromise.then(getLinkHeader);
  const dataPromise = fetchPromise.then(handleApiResponse);

  return Promise.all([dataPromise, linkPromise]).then(([teams, links]) => ({
    teams,
    links,
  }));
};

/**
 * Query teams with organization id
 * @param {string} orgId - id of organization
 * @returns {Object} promise from fetch.
 */
export const queryByOrganization = orgId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${orgId}/teams`;

  return fetchApi(url, options);
};

export const get = teamId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}`;

  return fetch(url, options).then(res => {
    captureSpecialJwt(TEAM_CLASSROOMS_PARTICIPATION_JWT)(res);
    return handleApiResponse(res);
  });
};

export const post = team => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(team),
  };

  const url = `${TRITON_URL_PREFIX}/api/teams`;

  return fetchApi(url, options);
};

export const update = team => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(team),
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${team.uid}`;

  return fetchApi(url, options);
};

export const attachOrganization = (team, organizationCode) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organization_code: organizationCode }),
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${team.uid}/organizations`;

  return fetchApi(url, options);
};

/**
 * Delete a team, being careful to extract the jwt in the response, as it gives
 * special permission with Neptune. We need to make a series of calls and just
 * grabbing the most recent jwt from local storage would be a race condition.
 *
 * @param {Object} team - the whole team object, not just the id.
 * @returns {Promise<string>} resolves with the special authorization
 *   header value, or a rejection if the call isn't successful
 */
const removeTeam = team => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${team.uid}`;

  let deleteAuthorization;
  return fetch(url, options)
    .then(response => {
      deleteAuthorization = response.headers.get('authorization');
      return response;
    })
    .then(handleApiResponse)
    .then(() => deleteAuthorization); // intended resolve value is here
};

const removeParticipationCodes = (survey, auth) => {
  // Must use the same special jwt for each that allows all the DELETE calls.
  const patchBody = survey.codes.map(code => ({
    method: 'DELETE',
    path: `/api/codes/${code.replace(/ /g, '-')}`,
  }));

  const options = {
    method: 'PATCH',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchBody),
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/codes`;

  return fetchApi(url, options);
};

export const remove = team =>
  // Need the survey to itemize the codes which should be removed.
  getSurveyByTeam(team.uid)
    .then(survey => Promise.all([survey, removeTeam(team)]))
    .then(([survey, auth]) => removeParticipationCodes(survey, auth));
