import uri from 'urijs';

import { TRITON_URL_PREFIX, fetchApi, getAuthorization } from './config';

/**
 * @param {string} userId - the user for whom to get digests
 * @param {string} read - optional, either 'true', 'false', or undefined to
 *   specify if you want read digests, unread digests, or both, respectively.
 * @returns {Promise} from fetch
 */
export const queryByUser = (userId, read) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = uri(`${TRITON_URL_PREFIX}/api/users/${userId}/digests`);
  url.setSearch({ read }); // noop if read is undefined

  return fetchApi(url, options);
};

export const update = (digest = {}) => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(digest),
  };

  const url = `${TRITON_URL_PREFIX}/api/digests/${digest.uid}`;

  return fetchApi(url, options);
};
