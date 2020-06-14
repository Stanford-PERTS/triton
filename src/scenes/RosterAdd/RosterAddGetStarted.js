import React from 'react';

import GetStarted from 'components/GetStarted';
import SectionItem from 'components/SectionItem';

const ClassroomRosterGetStarted = () => (
  <SectionItem>
    <GetStarted>
      <p>
        <strong>
          You haven&rsquo;t added any students to your class roster yet.
        </strong>
      </p>
      <p>You must do so before your students can participate in the survey.</p>
    </GetStarted>
  </SectionItem>
);

export default ClassroomRosterGetStarted;
