/**
 * Returns the JWT Auth Token payload.
 * You can provide a token or else the function will look in localStorage.
 * Returns false if we can't retrieve the token for any reason.
 * @param  {Object} token JWT Token, optional
 * @return {Object} Payload that has been JSON parsed.
 */
const getJwtPayload = token => {
  try {
    token = token || localStorage.getItem('triton:auth:token');
    const [, b64payload] = token.split('.');
    return JSON.parse(atob(unescape(encodeURIComponent(b64payload))));
  } catch (e) {
    return false;
  }
};

export default getJwtPayload;
