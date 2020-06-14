/**
 * Must match the behavior of `stripToken()` in the neptune portal.
 * Currently in app_participate/name_or_id/name_or_id.component.js
 * @param  {[type]} rawToken [description]
 * @return {[type]}          [description]
 */
function stripToken(rawToken) {
  // Clean up user input of tokens.
  // Token should be lowercase alpha numeric characters without whitespace.
  return typeof rawToken !== 'string'
    ? undefined
    : rawToken.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default stripToken;
