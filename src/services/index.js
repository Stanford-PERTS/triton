import noop from 'lodash/noop';

let PERTS = {};
let Raven = {};

try {
  // Browser enivronment.
  PERTS = window.PERTS || {};
  Raven = window.Raven || { captureMessage: noop };
} catch (e) {
  if (!(e instanceof ReferenceError)) {
    // Something weird happened.
    throw e;
  }
  // Else NodeJS environment (e.g. npm run faker) b/c there's no `window`.
}

// reportApiError will report an API fetch response error to Sentry, or write
// out to console.error if not in the production environment. `fetchResponse`
// is assumed to not contain an `ok` property with value true.

export const reportApiError = (
  // https://developer.mozilla.org/en-US/docs/Web/API/Response
  fetchResponse,
) =>
  PERTS.isProduction
    ? Raven.captureMessage(
        `${fetchResponse.status} ${fetchResponse.statusText}`,
      )
    : console.error(
        'reportApiError():',
        fetchResponse.status,
        fetchResponse.statusText,
        fetchResponse.url,
        fetchResponse,
      );

export const logToSentry = message =>
  PERTS.isProduction ? Raven.captureMessage(message) : console.error(message);
