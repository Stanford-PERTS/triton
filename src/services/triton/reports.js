import { TRITON_URL_PREFIX, fetchApi, getAuthorization } from './config';

export const queryByTeam = teamId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/reports`;

  return fetchApi(url, options);
};

export const queryByOrganization = orgId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${orgId}/reports`;

  return fetchApi(url, options);
};

export const uploadReport = (contextProperty, contextId, filename, file) => {
  const data = new FormData();
  data.append(contextProperty, contextId);
  data.append('filename', filename);
  data.append('file', file);

  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
    },
    body: data,
  };

  const url = `${TRITON_URL_PREFIX}/api/reports`;

  return fetchApi(url, options);
};

export const downloadReport = (classroomId, filename) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/classrooms/${classroomId}/reports/${filename}`;

  return fetch(url, options)
    .then(response => response.blob())
    .then(blob => {
      // Put together the following by smashing together the following:
      // https://stackoverflow.com/questions/42095152/open-pdf-stream-in-new-window-with-javascript
      // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
      // https://codepen.io/grimen/pen/lBuiG
      // https://stackoverflow.com/questions/20235772/is-it-possible-to-open-a-new-window-and-embed-iframe-in-to-this

      const win = window.open();
      win.document.write(
        '<iframe id="report" width="100%" height="100%"></iframe>',
      );
      const blobUrl = URL.createObjectURL(blob);
      const blobIframe = win.document.getElementById('report');
      blobIframe.src = blobUrl;
    })
    .catch(error => {
      // TODO use a logging library, sentry.io?
      console.warn('error', error);

      return Promise.reject({
        code: error.status,
        message: error.statusText,
      });
    });
};
