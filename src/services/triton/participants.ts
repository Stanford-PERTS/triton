/**
 * {
 *  uid: 'Participant_0123456789ab',
 *  short_uid: '0123456789ab',
 *  student_id: 'STUDENT12345',
 *  first_name: 'Viper',
 *  last_name: 'Jones',
 *  name: 'Viper Jones',
 *  classroom_id: 'Classroom_123456789ab',
 * }
 */

import Entity from 'services/Entity';
import {
  TRITON_URL_PREFIX,
  fetchApi,
  fetchOptionsGET,
  generateFetchFunctions,
} from 'services/triton/config';

export interface ParticipantEntity extends Entity {
  student_id: string;
  classroom_ids: string[];
}

const {
  query,
  get,
  post,
  postBatch,
  update,
  queryByClassroom,
  queryByTeam,
}: any = generateFetchFunctions('participants', {
  queryByClassroom: classroomId => {
    const url = `${TRITON_URL_PREFIX}/api/classrooms/${classroomId}/participants`;
    const options = fetchOptionsGET();
    return fetchApi(url, options);
  },
  queryByTeam: teamId => {
    const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/participants`;
    const options = fetchOptionsGET();
    return fetchApi(url, options);
  },
});

const remove = (participant, classroomId) => {
  participant.classroom_ids = participant.classroom_ids.filter(
    id => id !== classroomId,
  );
  return update(participant);
};

export {
  query,
  get,
  post,
  postBatch,
  update,
  remove,
  queryByClassroom,
  queryByTeam,
};
