// HTTP Header Authorization always begins 'Bearer '. This function strips that
// so we're left with only the JWT token.
const getJwtFromAuthorization = (headerValue = '') => headerValue.substr(7);

export default getJwtFromAuthorization;
