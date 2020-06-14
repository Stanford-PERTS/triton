import React, { useContext } from 'react';

import TermsContext from 'components/TermsContext';
import GetStarted from 'components/GetStarted';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const OrganizationUsersEmpty = () => {
  const terms = useContext(TermsContext);
  const termsOrganization = terms.organization;
  const termsTeachers = terms.members;
  const termsTeams = terms.teams;

  return (
    <Section title={`${terms.organization} Administrators`}>
      <SectionItem>
        <GetStarted>
          <p>
            <strong>
              You&rsquo;re the only one in this{' '}
              {termsOrganization.toLowerCase()}.
            </strong>
          </p>
          <p>
            {termsOrganization} Administrators can supervise{' '}
            {termsTeams.toLowerCase()} of {termsTeachers.toLowerCase()} and help
            them manage their settings. Here you can invite colleagues to your{' '}
            {termsOrganization.toLowerCase()}.
          </p>
        </GetStarted>
      </SectionItem>
    </Section>
  );
};

export default OrganizationUsersEmpty;
