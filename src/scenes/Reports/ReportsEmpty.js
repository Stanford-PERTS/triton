import React, { useContext } from 'react';
import * as routes from 'routes';

import GetStarted from 'components/GetStarted';
import Link from 'components/Link';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const ReportsEmpty = ({ classTerm, teamTerm }) => {
  const terms = useContext(TermsContext);
  return (
    <Section title="No Reports">
      <SectionItem>
        <GetStarted noarrow>
          <p>
            <strong>
              You haven&rsquo;t added any {terms.classrooms.toLowerCase()} yet.
            </strong>
          </p>
          <p>
            Go to{' '}
            <strong>
              <Link to={routes.toTeamClassrooms()}>
                {terms.team} {terms.classrooms}
              </Link>
            </strong>{' '}
            to add one.
          </p>
        </GetStarted>
      </SectionItem>
    </Section>
  );
};

export default ReportsEmpty;
