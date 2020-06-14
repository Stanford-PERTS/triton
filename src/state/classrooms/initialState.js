export default {
  // Dictionary of classroom objects keyed by uid
  byId: {},
  classroomMode: '',
  lastFetched: [],
  // classrooms load in progress
  loading: false,
  // TODO REMOVE. This is a temporary loading flag that should be removed with
  // the closing on #673.
  loadingClassroomDetails: false,
  // classrooms add or update in progress
  updating: false,
  // classrooms delete in progress
  deleting: false,
  // classrooms error
  error: null,
  queryResults: {},
};
