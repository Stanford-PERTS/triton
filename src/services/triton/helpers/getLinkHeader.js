/**
 * Get link header from a response if response ok.
 * @param {Object} response fetch response object
 * @return {string|undefined} link header value
 */
const getLinkHeader = response => {
  const header = response.headers.get('link');
  return response.ok && header ? header : undefined;
};

export default getLinkHeader;
