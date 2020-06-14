import uri from 'urijs';

import Entity from 'services/Entity';

import {
  TRITON_URL_PREFIX,
  fetchApi,
  getLinkHeader,
  getAuthorization,
  handleApiResponse,
} from './config';

export interface OrganizationEntity extends Entity {
  name: string;
  code: string;
  phone_number: string;
  mailing_address: string;
  program_id: string;
  num_teams: number;
  num_users: number;
}

export const getDefaultOrganization = ({
  uid = '',
  code = '',
  name = '',
} = {}) => ({
  uid,
  code,
  name,
});

export const organizationParams = Object.keys(getDefaultOrganization());

/**
 * List all organizations.
 * @param {string} userUid - user uid
 * @param {boolean} isAdmin - is user admin
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
    ? `${TRITON_URL_PREFIX}/api/organizations`
    : `${TRITON_URL_PREFIX}/api/users/${userUid}/organizations`;
  const url = uri(path).search(queryOptions);

  const fetchPromise = fetch(url, options).catch(error => {
    // TODO use a logging library, sentry.io?
    console.warn('error', error);

    return Promise.reject({
      code: error.status,
      message: error.statusText,
    });
  });

  const linkPromise = fetchPromise.then(getLinkHeader);

  const dataPromise = fetchPromise.then(handleApiResponse);

  return Promise.all([dataPromise, linkPromise]).then(
    ([organizations, links]) => ({ organizations, links }),
  );
};

export const get = organizationId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${organizationId}`;

  return fetchApi(url, options);
};

/**
 * Query organizations with team id
 * @param {string} teamId - id of team
 * @returns {Object} promise from fetch.
 */
export const queryByTeam = teamId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/organizations`;

  return fetchApi(url, options);
};

export const queryDashboard = organizationId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organization_dashboards/${organizationId}`;

  return fetchApi(url, options);
};

export const post = organization => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(organization),
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations`;

  return fetchApi(url, options);
};

export const update = organization => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(organization),
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${organization.uid}`;

  return fetchApi(url, options);
};

export const changeCode = orgId => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${orgId}/code`;

  return fetchApi(url, options);
};

export const remove = orgId => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${orgId}`;

  return fetchApi(url, options);
};
