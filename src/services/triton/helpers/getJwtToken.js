import { TRITON_COOKIES_AUTH_TOKEN } from 'services/triton/config';

/**
 * Get localStorage auth token.
 * @return {String} jwt auth token
 */
const getJwtToken = () => localStorage.getItem(TRITON_COOKIES_AUTH_TOKEN);

export default getJwtToken;
