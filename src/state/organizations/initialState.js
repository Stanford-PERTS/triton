export default {
  // dictionary of organizations keyed by uid
  byId: {},
  // array of the latest organization uids fetched from server
  // used for paging OrganizationsList
  lastFetched: [],
  // used by components to determine what to render
  organizationMode: '',
  // navigation URLs for paging list of teams
  links: '',
  // organizations load in progress
  loading: false,
  // organizations update in progress
  updating: false,
  // organizations add in progress
  adding: false,
  // organizations error
  error: null,
  queryResults: {},
};
