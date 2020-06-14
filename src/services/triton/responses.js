/**
 * {
 *  uid: 'Response_0123456789ab',
 *  short_uid: '0123456789ab',
 *  user_id: 'User_0123456789ab',
 *  parent_id: 'Cycle_0123456789ab',
 *  body: {
 *    height: 161,
 *    karma: 1,
 *    opinion: 'Minima illum ut et sed saepe beatae. At architecto minima sunt.
 *              Non veniam dolorum commodi maxime dicta. Velit assumenda labore
 *              necessitatibus voluptatem alias voluptas sunt natus recusandae.
 *              Sed voluptatibus sunt quia corporis consequatur. Veniam
 *              voluptatibus quo nesciunt aut incidunt cumque quia commodi
 *              veritatis.',
 *   }
 * }
 */

import uri from 'urijs';

import {
  TRITON_URL_PREFIX,
  fetchApi,
  fetchOptionsDELETE,
  fetchOptionsGET,
  fetchOptionsPOST,
  fetchOptionsPUT,
} from './config';

export const query = teamId => {
  const url = `${TRITON_URL_PREFIX}/api/responses`;
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const queryByUser = (userId, params = {}) => {
  const url = uri(`${TRITON_URL_PREFIX}/api/users/${userId}/responses`);
  url.addSearch(params); // optional param: parent_id
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const queryByTeam = (teamId, params = {}) => {
  const url = uri(`${TRITON_URL_PREFIX}/api/teams/${teamId}/responses`);
  url.addSearch(params); // optional param: parent_id
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const get = responseId => {
  const url = `${TRITON_URL_PREFIX}/api/responses/${responseId}`;
  const options = fetchOptionsGET();
  return fetchApi(url, options);
};

export const post = response => {
  const url = `${TRITON_URL_PREFIX}/api/responses`;
  const options = fetchOptionsPOST(response);
  return fetchApi(url, options);
};

export const update = (response, params = {}) => {
  const url = uri(`${TRITON_URL_PREFIX}/api/responses/${response.uid}`);
  url.addSearch(params); // optional param: force
  const options = fetchOptionsPUT(response);
  return fetchApi(url, options);
};

export const remove = responseId => {
  const url = `${TRITON_URL_PREFIX}/api/responses/${responseId}`;
  const options = fetchOptionsDELETE();
  return fetchApi(url, options);
};
