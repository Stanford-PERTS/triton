import keyBy from 'lodash/keyBy';

import mocks from 'mocks';
import { makeData } from './CycleProgressRender';

describe('makeData', () => {
  const users = [mocks.createUser(), mocks.createUser()];
  const usersById = keyBy(users, 'uid');
  const classrooms = [
    mocks.createClassroom({ contact_id: users[0].uid }),
    mocks.createClassroom({ contact_id: users[1].uid }),
  ];
  const classIds = classrooms.map(c => c.uid);
  const classroomsById = keyBy(classrooms, 'uid');
  const participants = [
    mocks.createParticipant({ student_id: 'ppt1', classroom_ids: classIds }),
    mocks.createParticipant({ student_id: 'ppt2', classroom_ids: classIds }),
  ];
  const participantsById = keyBy(participants, 'uid');
  const completionRows = [
    { participant_id: participants[0].uid, value: '100' },
  ];

  it('returns correct number of rows for team scope, all classes', () => {
    const tableData = makeData(
      completionRows,
      participantsById,
      classroomsById,
      usersById,
    );

    // 2 participants each in 2 classes: 4 rows.
    const expected = [
      {
        complete: 'Yes',
        rosterId: participants[0].student_id,
        classroomName: classrooms[0].name,
        contact: `${users[0].name} (${users[0].email})`,
      },
      {
        complete: 'Yes',
        rosterId: participants[0].student_id,
        classroomName: classrooms[1].name,
        contact: `${users[1].name} (${users[1].email})`,
      },
      {
        complete: 'No',
        rosterId: participants[1].student_id,
        classroomName: classrooms[0].name,
        contact: `${users[0].name} (${users[0].email})`,
      },
      {
        complete: 'No',
        rosterId: participants[1].student_id,
        classroomName: classrooms[1].name,
        contact: `${users[1].name} (${users[1].email})`,
      },
    ];
    expect(tableData).toEqual(expected);
  });

  it('returns correct number of rows for user scope, some classes', () => {
    // Filter classrooms to just one user.
    const userClassrooms = { [classrooms[0].uid]: classrooms[0] };
    const tableData = makeData(
      completionRows,
      participantsById,
      userClassrooms,
      usersById,
    );

    // 2 participants each in just 1 class: 2 rows.
    const expected = [
      {
        complete: 'Yes',
        rosterId: participants[0].student_id,
        classroomName: classrooms[0].name,
        contact: `${users[0].name} (${users[0].email})`,
      },
      {
        complete: 'No',
        rosterId: participants[1].student_id,
        classroomName: classrooms[0].name,
        contact: `${users[0].name} (${users[0].email})`,
      },
    ];
    expect(tableData).toEqual(expected);
  });
});
