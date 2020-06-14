let PERTS = {};

try {
  // Browser enivronment.
  PERTS = window.PERTS || {};
} catch (e) {
  if (!(e instanceof ReferenceError)) {
    // Something weird happened.
    throw e;
  }
  // Else NodeJS environment (e.g. npm run faker) b/c there's no `window`.
}

export const NEPTUNE_PROTOCOL = PERTS.NEPTUNE_PROTOCOL || 'http';
export const NEPTUNE_DOMAIN = PERTS.NEPTUNE_DOMAIN || 'localhost:8080';
export const NEPTUNE_URL_PREFIX = `${NEPTUNE_PROTOCOL}://${NEPTUNE_DOMAIN}`;
export const NEPTUNE_PLATFORM_NAME = 'neptune';

export const TRITON_PROTOCOL = PERTS.TRITON_PROTOCOL || 'http';
export const TRITON_DOMAIN = PERTS.TRITON_DOMAIN || 'localhost:10080';
export const TRITON_URL_PREFIX = `${TRITON_PROTOCOL}://${TRITON_DOMAIN}`;
export const TRITON_PLATFORM_NAME = 'triton';

export const TRITON_COOKIES_AUTH_USER = 'triton:auth:user';
export const TRITON_COOKIES_AUTH_TOKEN = 'triton:auth:token';

export const CONTACT_EMAIL_ADDRESS = 'copilot@perts.net';
export const CONTACT_NAME = 'Copilot';
// Used for routing purposes, to return back to new team creation.
export const NEW_TEAM_ID = 'Team_new';

export { default as captureSpecialJwt } from './helpers/captureSpecialJwt';
export {
  fetchOptionsDELETE,
  fetchOptionsGET,
  fetchOptionsPATCH,
  fetchOptionsPOST,
  fetchOptionsPUT,
} from './helpers/fetchOptions';
export {
  default as generateFetchFunctions,
} from './helpers/generateFetchFunctions';
export { default as getAuthorization } from './helpers/getAuthorization';
export {
  default as getJwtFromAuthorization,
} from './helpers/getJwtFromAuthorization';
export { default as fetchApi } from './helpers/fetchApi';
export { default as getJwtPayload } from './helpers/getJwtPayload';
export { default as getJwtToken } from './helpers/getJwtToken';
export { default as getLinkHeader } from './helpers/getLinkHeader';
export { default as getSpecialJwt } from './helpers/getSpecialJwt';
export { default as handleApiResponse } from './helpers/handleApiResponse';
export { default as setJwtToken } from './helpers/setJwtToken';
