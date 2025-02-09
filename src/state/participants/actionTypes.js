export const PARTICIPANTS_QUERY_REQUEST = 'PARTICIPANTS_QUERY_REQUEST';
export const PARTICIPANTS_QUERY_SUCCESS = 'PARTICIPANTS_QUERY_SUCCESS';
export const PARTICIPANTS_QUERY_FAILURE = 'PARTICIPANTS_QUERY_FAILURE';

export const PARTICIPANTS_GET_REQUEST = 'PARTICIPANTS_GET_REQUEST';
export const PARTICIPANTS_GET_SUCCESS = 'PARTICIPANTS_GET_SUCCESS';
export const PARTICIPANTS_GET_FAILURE = 'PARTICIPANTS_GET_FAILURE';

export const PARTICIPANTS_ADD_REQUEST = 'PARTICIPANTS_ADD_REQUEST';
export const PARTICIPANTS_ADD_SUCCESS = 'PARTICIPANTS_ADD_SUCCESS';
export const PARTICIPANTS_ADD_FAILURE = 'PARTICIPANTS_ADD_FAILURE';

// Wraps these to get an accurate count of participants:
// * PARTICIPANT_ADD_REQUEST
// * CLASSROOM_GET_REQUEST
export const HOA_PARTICIPANTS_ADD_REQUEST = 'HOA_PARTICIPANTS_ADD_REQUEST';
export const HOA_PARTICIPANTS_ADD_SUCCESS = 'HOA_PARTICIPANTS_ADD_SUCCESS';
export const HOA_PARTICIPANTS_ADD_FAILURE = 'HOA_PARTICIPANTS_ADD_FAILURE';

export const PARTICIPANTS_UPDATE_REQUEST = 'PARTICIPANTS_UPDATE_REQUEST';
export const PARTICIPANTS_UPDATE_SUCCESS = 'PARTICIPANTS_UPDATE_SUCCESS';
export const PARTICIPANTS_UPDATE_FAILURE = 'PARTICIPANTS_UPDATE_FAILURE';

export const PARTICIPANTS_REMOVE_REQUEST = 'PARTICIPANTS_REMOVE_REQUEST';
export const PARTICIPANTS_REMOVE_SUCCESS = 'PARTICIPANTS_REMOVE_SUCCESS';
export const PARTICIPANTS_REMOVE_FAILURE = 'PARTICIPANTS_REMOVE_FAILURE';

// Wraps these to get an accurate count of participants:
// * PARTICIPANT_DELETE_REQUEST
// * CLASSROOM_GET_REQUEST
export const HOA_PARTICIPANTS_REMOVE_REQUEST =
  'HOA_PARTICIPANTS_REMOVE_REQUEST';
export const HOA_PARTICIPANTS_REMOVE_SUCCESS =
  'HOA_PARTICIPANTS_REMOVE_SUCCESS';
export const HOA_PARTICIPANTS_REMOVE_FAILURE =
  'HOA_PARTICIPANTS_REMOVE_FAILURE';

export const PARTICIPANTS_REQUEST_ACTIONS = /^PARTICIPANTS?_\w+_REQUEST$/;
export const PARTICIPANTS_SUCCESS_ACTIONS = /^PARTICIPANTS?_\w+_SUCCESS$/;
export const PARTICIPANTS_FAILURE_ACTIONS = /^PARTICIPANTS?_\w+_FAILURE$/;

export const PARTICIPANTS_QUERY_REQUEST_ACTIONS = /^PARTICIPANTS?_(QUERY|GET)_\w+_REQUEST$/;
export const PARTICIPANTS_QUERY_SUCCESS_ACTIONS = /^PARTICIPANTS?_(QUERY|GET)_\w+_SUCCESS$/;
export const PARTICIPANTS_QUERY_FAILURE_ACTIONS = /^PARTICIPANTS?_(QUERY|GET)_\w+_FAILURE$/;

export const PARTICIPANTS_UPDATING_REQUEST_ACTIONS = /^PARTICIPANTS?_(ADD|UPDATE|REMOVE)_REQUEST$/;
export const PARTICIPANTS_UPDATING_SUCCESS_ACTIONS = /^PARTICIPANTS?_(ADD|UPDATE|REMOVE)_SUCCESS$/;
export const PARTICIPANTS_UPDATING_FAILURE_ACTIONS = /^PARTICIPANTS?_(ADD|UPDATE|REMOVE)_FAILURE$/;
