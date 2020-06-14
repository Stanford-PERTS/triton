import React, { useContext } from 'react';

import TermsContext from 'components/TermsContext';
import GetStarted from 'components/GetStarted';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const OrganizationClassroomsEmpty = () => {
  const terms = useContext(TermsContext);
  const termsClassrooms = terms.classrooms.toLowerCase();
  const termsTeams = terms.teams.toLowerCase();
  const termsOrganizations = terms.organization.toLowerCase();

  return (
    <Section dark title={`${termsClassrooms} on Associated ${termsTeams}`}>
      <SectionItem>
        <GetStarted noarrow>
          <p>
            <strong>There are no {termsClassrooms} yet.</strong>
          </p>
          <p>
            You&rsquo;ll need to add {termsClassrooms} to {termsTeams} that are
            associated with this {termsOrganizations}.
          </p>
        </GetStarted>
      </SectionItem>
    </Section>
  );
};

export default OrganizationClassroomsEmpty;
