export default {
  // dictionary of teams keyed by uid
  byId: {},
  // array of the latest team uids fetched from server
  // used to page TeamsList
  lastFetched: [],
  // navigation URLs for paging list of teams
  links: '',
  // used by components to determine what to render
  teamMode: '',
  // teams load in progress
  loading: false,
  // teams update in progress
  updating: false,
  // teams add in progress
  adding: false,
  // teams delete in progress
  deleting: false,
  // teams error
  error: null,
  queryResults: {},
};
