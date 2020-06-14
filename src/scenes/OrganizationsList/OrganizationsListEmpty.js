import React, { useContext } from 'react';
import GetStarted from 'components/GetStarted';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const TeamsListEmpty = () => {
  const terms = useContext(TermsContext);

  return (
    <SectionItem>
      <GetStarted>
        <p>
          <strong>
            You haven&rsquo;t added any {terms.organizations.toLowerCase()} yet.
          </strong>
        </p>
        <p>
          Click the <strong>Add</strong> button to get started.
        </p>
      </GetStarted>
    </SectionItem>
  );
};

export default TeamsListEmpty;
