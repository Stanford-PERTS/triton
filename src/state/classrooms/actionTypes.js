export const CLASSROOM_REQUEST_ACTIONS = /^CLASSROOMS?_\w+_REQUEST$/;
export const CLASSROOM_SUCCESS_ACTIONS = /^CLASSROOMS?_\w+_SUCCESS$/;
export const CLASSROOM_FAILURE_ACTIONS = /^CLASSROOMS?_\w+_FAILURE$/;

export const CLASSROOM_LOADING_REQUEST_ACTIONS = /^CLASSROOMS?_(GET|QUERY_BY_TEAM)_REQUEST$/;
export const CLASSROOM_LOADING_SUCCESS_ACTIONS = /^CLASSROOMS?_(GET|QUERY_BY_TEAM)_SUCCESS$/;
export const CLASSROOM_LOADING_FAILURE_ACTIONS = /^CLASSROOMS?_(GET|QUERY_BY_TEAM)_FAILURE$/;

export const CLASSROOM_AU_REQUEST_ACTIONS = /^CLASSROOM_(ADD|UPDATE)_REQUEST$/;
export const CLASSROOM_AU_SUCCESS_ACTIONS = /^CLASSROOM_(ADD|UPDATE)_SUCCESS$/;
export const CLASSROOM_AU_FAILURE_ACTIONS = /^CLASSROOM_(ADD|UPDATE)_FAILURE$/;

export const TEAM_CLASSROOMS_REQUEST =
  'HOA_CLASSROOMS_QUERY_WITH_PARTICIPATION_BY_TEAM_REQUEST';
export const TEAM_CLASSROOMS_SUCCESS =
  'HOA_CLASSROOMS_QUERY_WITH_PARTICIPATION_BY_TEAM_SUCCESS';
export const TEAM_CLASSROOMS_FAILURE =
  'HOA_CLASSROOMS_QUERY_WITH_PARTICIPATION_BY_TEAM_FAILURE';
export const teamClassroomsResult = action =>
  [TEAM_CLASSROOMS_SUCCESS, TEAM_CLASSROOMS_FAILURE].includes(action.type);

export const CLASSROOM_DETAIL_REQUEST = 'CLASSROOM_DETAIL_REQUEST';
export const CLASSROOM_DETAIL_SUCCESS = 'CLASSROOM_DETAIL_SUCCESS';
export const CLASSROOM_DETAIL_FAILURE = 'CLASSROOM_DETAIL_FAILURE';

// TODO REMOVE. This is a temporary action type added to solve the toggling
// of loading on Classroom Details page. This should be removed once loading is
// being handled properly, which we plan on addressing with #673.
export const CLASSROOM_DETAIL_SCENE_REQUEST = 'CLASSROOM_DETAIL_SCENE_REQUEST';
export const CLASSROOM_DETAIL_SCENE_SUCCESS = 'CLASSROOM_DETAIL_SCENE_SUCCESS';
export const CLASSROOM_DETAIL_SCENE_FAILURE = 'CLASSROOM_DETAIL_SCENE_FAILURE';

export const CLASSROOM_GET_REQUEST = 'CLASSROOMS_GET_REQUEST';
export const CLASSROOM_GET_SUCCESS = 'CLASSROOMS_GET_SUCCESS';
export const CLASSROOM_GET_FAILURE = 'CLASSROOMS_GET_FAILURE';

export const CLASSROOM_ADD_REQUEST = 'CLASSROOM_ADD_REQUEST';
export const CLASSROOM_ADD_SUCCESS = 'CLASSROOM_ADD_SUCCESS';
export const CLASSROOM_ADD_FAILURE = 'CLASSROOM_ADD_FAILURE';

export const CLASSROOM_UPDATE_REQUEST = 'CLASSROOM_UPDATE_REQUEST';
export const CLASSROOM_UPDATE_SUCCESS = 'CLASSROOM_UPDATE_SUCCESS';
export const CLASSROOM_UPDATE_FAILURE = 'CLASSROOM_UPDATE_FAILURE';

export const CLASSROOM_REMOVE_REQUEST = 'CLASSROOM_REMOVE_REQUEST';
export const CLASSROOM_REMOVE_SUCCESS = 'CLASSROOM_REMOVE_SUCCESS';
export const CLASSROOM_REMOVE_FAILURE = 'CLASSROOM_REMOVE_FAILURE';

export const CLASSROOM_MODE_SET = 'CLASSROOM_MODE_SET';
export const CLASSROOM_MODE_RESET = 'CLASSROOM_MODE_RESET';
