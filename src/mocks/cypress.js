// Cypress related mocks

import jwt from 'jsonwebtoken';
import {
  TRITON_COOKIES_AUTH_USER,
  TRITON_COOKIES_AUTH_TOKEN,
} from 'services/triton/config';

/**
 * Mocks the authorization JWT token that Neptune returns.
 * @param  {string} userId Authenticated user uid
 * @param  {string} email  Authenticated user email
 * @return {string}        JWT token
 */
const mockAuthorizationJwt = (userId, email) => {
  const adjustDateTime = datetime => Math.floor(datetime / 1000);

  return jwt.sign(
    {
      iat: adjustDateTime(Date.now()),
      // Expire this token in the future so they are good during testing
      exp: adjustDateTime(Date.now() + 60 * 60 * 1000),
      user_id: userId,
      email,
    },
    'I am a fake secret.',
  );
};

/**
 * Mocks the reponse.header that Neptune returns.
 * @param  {string} userId Authenticated user uid
 * @param  {string} email  Authenticated user email address
 * @return {string}        JWT payload token
 */
const mockNeptuneResponseHeaders = (userId, email) => ({
  authorization: `Bearer ${mockAuthorizationJwt(userId, email)}`,
});

/**
 * Mocks the Neptune response for `/api/accounts/${email}`.
 * @param  {string} email    User's email address
 * @param  {string} verified Whether the user's account is verified
 * @return {boolean}         Server response object
 */
const mockNeptuneAccountsResponse = (email, verified = true) => ({
  email,
  verified,
});

/**
 * Sets up the required Cypress stubs for authentication related api routes.
 * @param  {Object} cy   Cypress test object
 * @param  {Object} user Triton/Neptune user object
 * @return {undefined}
 */
const setupAuthenticationRoutes = (cy, user) => {
  cy.route({
    method: 'POST',
    url: 'http://localhost:8080/api/login',
    headers: mockNeptuneResponseHeaders(user.uid, user.email),
    response: user,
  });
  cy.route(`http://localhost:10080/api/users/${user.uid}`, user);
  cy.route(
    `http://localhost:8080/api/accounts/${user.email}`,
    mockNeptuneAccountsResponse(user.email),
  );
};

/**
 * Pre-authenticates the provided user.
 * @param  {Object} user Triton/Neptune user object
 * @return {undefined}
 */
const authenticate = user => {
  localStorage.setItem(TRITON_COOKIES_AUTH_USER, JSON.stringify(user));
  localStorage.setItem(
    TRITON_COOKIES_AUTH_TOKEN,
    mockAuthorizationJwt(user.uid, user.email),
  );
};

const authRoute = (cy, user, url, response) => {
  cy.route({
    method: 'GET',
    url,
    headers: mockNeptuneResponseHeaders(user.uid, user.email),
    response,
  });
};

export default {
  authenticate,
  authRoute,
  mockAuthorizationJwt,
  mockNeptuneResponseHeaders,
  setupAuthenticationRoutes,
};
