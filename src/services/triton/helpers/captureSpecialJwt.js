import { getJwtFromAuthorization } from 'services/triton/config';

/**
 * Save jwts that have special endpoint permission on neptune.
 * @param {string} storageName key under which to store the jwt
 * @returns {Function} for promise chaining
 */
const captureSpecialJwt = storageName => response => {
  localStorage.setItem(
    `triton:auth:${storageName}`,
    getJwtFromAuthorization(response.headers.get('authorization')),
  );
  return response;
};

export default captureSpecialJwt;
