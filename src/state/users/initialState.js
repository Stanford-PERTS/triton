export default {
  byId: {},
  error: null,
  // Map of unique invitees keyed by email rather than uid, because
  // invitee may not have a uid
  inviteesByEmail: {},
  inviting: false,
  lastFetched: [],
  loading: false,
  queryResults: {},
  updating: false,
  userMode: '',
  verifying: false,
};
