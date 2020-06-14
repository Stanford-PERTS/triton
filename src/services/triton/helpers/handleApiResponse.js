import { setJwtToken } from 'services/triton/config';
import { reportApiError } from 'services';

/**
 * Handles Neptune/Triton API responses.
 * @param  {Object} response fetch response object
 * @return {[type]}          [description]
 */
const handleApiResponse = response => {
  if (response.ok) {
    if (response.headers.get('authorization')) {
      // if the fetch response is ok and response headers has authorization
      // token, then set JWT Auth Token
      setJwtToken(response);
    }

    if (response.status === 204) {
      // HTTP 204 No Content
      return null;
    }
    // and return the parsed json body
    return response.json();
  }

  // else, get any useful information from the response and reject
  reportApiError(response);

  return response.text().then(body => {
    const error = new Error(body);
    error.code = response.status;
    try {
      error.message = JSON.parse(body);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error('Triton returned non-JSON error message:', body);
        error.message = body;
      } else {
        throw e;
      }
    }
    return Promise.reject(error);
  });
};

export default handleApiResponse;
