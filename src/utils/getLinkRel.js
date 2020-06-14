import uri from 'urijs';
import isEmpty from 'lodash/isEmpty';
import LinkHeader from 'http-link-header';

/**
 * Extract query string parameters from an unparsed Link header string.
 * @param {string} linkHeader - value of Link header from a response.
 * @param {string} rel - either first, previous, self, next, or last.
 * @returns {Object|undefined} query params from the url of that part of the
 *     header.
 */
export default function getLinkRel(linkHeader, rel) {
  if (isEmpty(linkHeader)) {
    return undefined;
  }
  const parsed = LinkHeader.parse(linkHeader);
  const link = parsed.get('rel', rel)[0].uri;
  // http://medialize.github.io/URI.js/docs.html#accessors-search
  return uri(link).search(true); // arg triggers return as param object
}
