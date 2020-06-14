import {
  TRITON_URL_PREFIX,
  fetchApi,
  fetchOptionsDELETE,
  fetchOptionsGET,
  fetchOptionsPATCH,
  fetchOptionsPOST,
  fetchOptionsPUT,
} from 'services/triton/config';

/**
 * Since most of the fetch functions for triton services end up looking very
 * similar this function generates the commons ones (query, get, post, update,
 * remove) and allows you to pass additional functions in using the
 * overrideFunctions parameter.
 *
 * Example, calling generateFetchFunctions('participants') will generate:
 *   participants.query
 *   participants.get
 *   participants.post
 *   participants.update
 *   participants.remove
 */

const generateFetchFunctions = (entityName, overrideFunctions = {}) => ({
  query: (params = {}) => {
    const url = `${TRITON_URL_PREFIX}/api/${entityName}`;
    const options = fetchOptionsGET();
    return fetchApi(url, options);
  },

  get: entityId => {
    const url = `${TRITON_URL_PREFIX}/api/${entityName}/${entityId}`;
    const options = fetchOptionsGET();
    return fetchApi(url, options);
  },

  post: entity => {
    const url = `${TRITON_URL_PREFIX}/api/${entityName}`;
    const options = fetchOptionsPOST(entity);
    return fetchApi(url, options);
  },

  postBatch: entities => {
    const path = `/api/${entityName}`;
    const url = `${TRITON_URL_PREFIX}${path}`;
    const options = fetchOptionsPATCH();
    options.body = JSON.stringify(
      entities.map(e => ({ method: 'POST', path, body: e })),
    );
    return fetchApi(url, options);
  },

  update: entity => {
    const url = `${TRITON_URL_PREFIX}/api/${entityName}/${entity.uid}`;
    const options = fetchOptionsPUT(entity);
    return fetchApi(url, options);
  },

  remove: entityId => {
    const url = `${TRITON_URL_PREFIX}/api/${entityName}/${entityId}`;
    const options = fetchOptionsDELETE();
    return fetchApi(url, options);
  },

  ...overrideFunctions,
});

export default generateFetchFunctions;
