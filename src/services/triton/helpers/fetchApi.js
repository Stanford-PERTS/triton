import { fetchDedupe } from 'fetch-dedupe';
import handleApiResponse from './handleApiResponse';

// wrapper around fetch() that prevents duplicate requests
// https://github.com/jamesplease/fetch-dedupe

const fetchApi = (url, options) =>
  fetchDedupe(url, options).then(handleApiResponse);

export default fetchApi;
