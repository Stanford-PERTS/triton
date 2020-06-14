import React, { useContext } from 'react';

import GetStarted from 'components/GetStarted';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const TeamsListEmpty = ({ newTeamRoute, ...props }) => {
  // If newTeamRoute is defined then we can add a new team
  const canAddTeam = Boolean(newTeamRoute);
  const terms = useContext(TermsContext);

  return canAddTeam ? (
    <SectionItem>
      <GetStarted>
        <p>
          <strong>
            You haven&rsquo;t added any {terms.teams.toLowerCase()} yet.
          </strong>
        </p>
        <p>
          Click the <strong>Add</strong> button to get started.
        </p>
      </GetStarted>
    </SectionItem>
  ) : (
    <SectionItem>There are no teams</SectionItem>
  );
};

export default TeamsListEmpty;
