import React from 'react';

import Card from 'components/Card';
import GetStarted from 'components/GetStarted';

const ClassroomRosterGetStarted = props => (
  <Card.Content>
    <GetStarted {...props} warning>
      <p>
        <strong>
          You haven&rsquo;t added any students to your roster yet.
        </strong>
      </p>
      <p>You must do so before your students can participate in the survey.</p>
    </GetStarted>
  </Card.Content>
);

export default ClassroomRosterGetStarted;
