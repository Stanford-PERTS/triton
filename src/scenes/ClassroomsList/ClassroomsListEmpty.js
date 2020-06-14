import React, { useContext } from 'react';

import GetStarted from 'components/GetStarted';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const ClassroomsListEmpty = ({ newClassroomRoute, ...props }) => {
  // If newClassroomRoute is defined then we can add a new classroom
  const canAddClassroom = Boolean(newClassroomRoute);
  const terms = useContext(TermsContext);

  if (canAddClassroom) {
    return (
      <SectionItem>
        <GetStarted>
          <p>
            <strong>
              You haven&rsquo;t added any {terms.classrooms.toLowerCase()} yet.
            </strong>
          </p>
          <p>
            Click the <strong>Add</strong> button to get started.
          </p>
        </GetStarted>
      </SectionItem>
    );
  }

  return (
    <SectionItem>There are no {terms.classrooms.toLowerCase()}.</SectionItem>
  );
};

export default ClassroomsListEmpty;
