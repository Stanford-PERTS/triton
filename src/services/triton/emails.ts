import { TRITON_URL_PREFIX, fetchApi, getAuthorization } from './config';

interface Email {
  to_address: string;
  mandrill_template: string; // slug
  mandrill_template_content: object;
}

/**
 * @param {string} to_address  single email address to send message to
 * @param {string} slug        mandrill id of template to use
 * @param {Object} data        to interpolate into template (see
 * mandrill_template_content)
 * @return {Promise} resolving with server response
 */
export const post = (to_address: string, slug: string, data: object) => {
  const email: Email = {
    to_address,
    mandrill_template: slug,
    mandrill_template_content: data,
  };

  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  };

  const url = `${TRITON_URL_PREFIX}/api/emails`;

  return fetchApi(url, options);
};
