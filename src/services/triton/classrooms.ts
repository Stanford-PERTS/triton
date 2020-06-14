import Entity from 'services/Entity';
import {
  NEPTUNE_URL_PREFIX,
  TRITON_URL_PREFIX,
  fetchApi,
  getAuthorization,
} from './config';

import {
  getSurveyParams,
  queryByTeam as getSurveyByTeam,
} from 'services/triton/surveys';

export interface ClassroomEntity extends Entity {
  name: string;
  team_id: string;
  code: string;
  contact_id: string;
  contact_name: string;
  team_name?: string;
  num_students: number;
  grade_level: string;
}

export const DEFAULT_CLASSROOM_NAME = 'Default Roster';

export const query = () => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/classrooms`;

  return fetchApi(url, options);
};

export const queryByTeam = teamId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/classrooms`;

  return fetchApi(url, options);
};

export const get = classroomId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/classrooms/${classroomId}`;

  return fetchApi(url, options);
};

export const postParticipationCode = (classroom, survey) => {
  const params = {
    organization_id: survey.team_id,
    program_label: classroom.program_label.toLowerCase(),
    survey_params: getSurveyParams(survey),
  };

  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/codes`;

  return fetchApi(url, options);
};

const postClassroom = (classroom, code) => {
  const newClassroom = {
    ...classroom, // team_id and contact_id
    code,
  };

  const options = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newClassroom),
  };

  const url = `${TRITON_URL_PREFIX}/api/classrooms`;

  return fetchApi(url, options);
};

export const post = classroom =>
  getSurveyByTeam(classroom.team_id)
    .then(survey => postParticipationCode(classroom, survey))
    .then(codeResponse => postClassroom(classroom, codeResponse.code));

export const update = classroom => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classroom),
  };

  const url = `${TRITON_URL_PREFIX}/api/classrooms/${classroom.uid}`;

  return fetchApi(url, options);
};

const removeClassroom = classroom => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/classrooms/${classroom.uid}`;

  return fetchApi(url, options).then(() => classroom.code);
};

const removeParticipationCode = code => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/codes/${code.replace(/ /g, '-')}`;

  return fetchApi(url, options);
};

export const remove = classroom =>
  removeClassroom(classroom).then(removeParticipationCode);
