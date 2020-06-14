import React, { useContext, useMemo } from 'react';

import fromParams from 'utils/fromParams';

import Card from 'components/Card';
import TermsContext from 'components/TermsContext';
import CycleProgressTable from './CycleProgressTable';

export const makeData = (
  completionRows,
  participantsById,
  classroomsById,
  usersById,
) => {
  const rosterEntries = [];
  for (const ppt of Object.values(participantsById)) {
    // The classrooms of interest may be fewer than those on the whole team, if
    // we're displaying for just one user.
    const classroomsIdsInScope = ppt.classroom_ids.filter(
      cid => cid in classroomsById,
    );
    for (const classroomId of classroomsIdsInScope) {
      const classroom = classroomsById[classroomId] || {};
      const contact = usersById[classroom.contact_id] || {};
      const row =
        completionRows.find(cr => cr.participant_id === ppt.uid) || {};
      rosterEntries.push({
        complete: row.value === '100' ? 'Yes' : 'No',
        rosterId: ppt.student_id,
        classroomName: classroom.name,
        contact: `${contact.name || contact.email}${
          contact.name ? ` (${contact.email})` : ''
        }`,
      });
    }
  }
  return rosterEntries;
};

const CycleProgressRender = ({
  cycle,
  classroomsById,
  contactClassroomsById,
  completionRows,
  parentLabel,
  participantsById,
  stepType,
  teamId,
  usersById,
  ...rest
}) => {
  const { scope } = fromParams(rest);
  const terms = useContext(TermsContext);

  // The set of classrooms we use varies by the scene's scope.
  const cById = scope === 'team' ? classroomsById : contactClassroomsById;

  // https://react-table.js.org/quickstart
  const columns = useMemo(
    () => [
      { Header: 'Complete', accessor: 'complete' },
      { Header: 'Roster ID', accessor: 'rosterId' },
      { Header: `${terms.classroom} Name`, accessor: 'classroomName' },
      { Header: 'Contact', accessor: 'contact' },
    ],
    [terms.classroom],
  );
  const data = useMemo(
    () => makeData(completionRows, participantsById, cById, usersById),
    [completionRows, participantsById, cById, usersById],
  );

  return (
    <Card.Content>
      <CycleProgressTable columns={columns} data={data} />
    </Card.Content>
  );
};

export default CycleProgressRender;
