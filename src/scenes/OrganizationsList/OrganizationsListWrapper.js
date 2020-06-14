import React, { useContext } from 'react';
import TermsContext from 'components/TermsContext';
import Section from 'components/Section';

const OrganizationsListWrapper = ({ children, newOrganizationRoute }) => {
  const terms = useContext(TermsContext);

  return (
    <Section
      dark
      title={`Your ${terms.organizations}`}
      to={newOrganizationRoute}
    >
      {children}
    </Section>
  );
};

export default OrganizationsListWrapper;
