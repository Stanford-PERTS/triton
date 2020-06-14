import {
  TRITON_COOKIES_AUTH_TOKEN,
  getJwtFromAuthorization,
} from 'services/triton/config';

/**
 * Set locaStorage auth token to received auth token.
 * @param {Object} response fetch response object
 * @return {undefined}
 */
export const setJwtToken = response => {
  localStorage.setItem(
    TRITON_COOKIES_AUTH_TOKEN,
    getJwtFromAuthorization(response.headers.get('authorization')),
  );
};

export default setJwtToken;
