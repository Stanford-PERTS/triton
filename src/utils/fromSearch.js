import uri from 'urijs';

/**
 * Get search / query string params for current view.
 * @param {Object} props of some scene component
 * @return {Object} of query params, possibly empty.
 */
export default function fromSearch(props) {
  // http://medialize.github.io/URI.js/docs.html#accessors-search
  return uri(props.location.search).search(true);
}
