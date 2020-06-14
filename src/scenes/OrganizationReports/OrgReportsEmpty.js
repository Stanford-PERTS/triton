import React from 'react';

import GetStarted from 'components/GetStarted';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const OrgReportsEmpty = () => (
  <Section title="No Reports">
    <SectionItem>
      <GetStarted noarrow>
        <p>
          <strong>No reports yet.</strong>
        </p>
        <p>
          You don&rsquo;t have any reports available. Reports are issued once a
          week once your start collecting data.
        </p>
      </GetStarted>
    </SectionItem>
  </Section>
);

export default OrgReportsEmpty;
