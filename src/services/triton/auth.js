import {
  NEPTUNE_URL_PREFIX,
  TRITON_URL_PREFIX,
  TRITON_COOKIES_AUTH_USER,
  TRITON_COOKIES_AUTH_TOKEN,
  TRITON_PLATFORM_NAME,
  CONTACT_EMAIL_ADDRESS,
  fetchApi,
  getAuthorization,
  handleApiResponse,
} from './config';

const login = (email, password) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ auth_type: 'email', email, password }),
  };

  return fetch(`${NEPTUNE_URL_PREFIX}/api/login`, options)
    .then(handleApiResponse)
    .catch(error =>
      Promise.reject({
        code: 'error',
        message: 'User and/or password is incorrect.',
      }),
    );
};

const logout = () => {
  localStorage.removeItem(TRITON_COOKIES_AUTH_USER);
  localStorage.removeItem(TRITON_COOKIES_AUTH_TOKEN);
  return Promise.resolve();
};

const isEmailNew = email => {
  const options = {
    method: 'GET',
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/accounts/${email}`;

  return fetch(url, options).then(response => response.status === 404);
};

const register = email =>
  isEmailNew(email).then(isUnique => {
    if (isUnique) {
      // email is unique (on neptune), so we will attempt to register on triton
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          domain: TRITON_URL_PREFIX,
          platform: TRITON_PLATFORM_NAME,
          template_content: {
            contact_email_address: CONTACT_EMAIL_ADDRESS,
          },
        }),
      };

      const url = `${NEPTUNE_URL_PREFIX}/api/register`;

      return fetch(url, options).catch(error =>
        Promise.reject({
          code: 'register/error',
          message: 'Trouble registering. Please try again.',
        }),
      );
    }

    // email is not unique (on neptune), so we won't register
    return Promise.reject({
      code: 'register/email',
      message: 'Email address not available.',
    });
  });

const setPassword = (token, password) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/set_password`;

  return fetchApi(url, options);
};

const resetPassword = email => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      domain: TRITON_URL_PREFIX,
      platform: TRITON_PLATFORM_NAME,
      template_content: {
        contact_email_address: CONTACT_EMAIL_ADDRESS,
      },
    }),
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/reset_password`;

  return fetchApi(url, options);
};

const checkToken = token => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/auth_tokens/${token}/user`;

  return fetchApi(url, options);
};

const imitateUser = email => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/login/${email}`;

  return fetchApi(url, options);
};

/**
 * Ask Neptune if a user has been "verified" i.e. set a password.
 *
 * @param {string} email address
 * @returns {Promise<boolean>} whether the user is verified.
 */
const verify = email => {
  /* eslint prefer-promise-reject-errors: "off" */
  const options = {
    method: 'GET',
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/accounts/${email}`;

  return (
    fetch(url, options)
      // https://stackoverflow.com/questions/32721850/why-the-response-object-from-javascript-fetch-api-is-a-promise
      .then(response => response.json())
      .then(response => response.verified)
      .catch(() => false)
  );
};

export default {
  login,
  logout,
  register,
  setPassword,
  resetPassword,
  checkToken,
  imitateUser,
  verify,
};
