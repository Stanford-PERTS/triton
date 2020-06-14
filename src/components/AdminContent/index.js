import React from 'react';

import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

import ImitateUser from 'scenes/ImitateUser';

import * as route from 'routes';

const AdminContent = () => (
  <Section dark title="Admin">
    <SectionItem to={route.toReportsUpload()}>Upload Reports</SectionItem>
    <SectionItem>
      <ImitateUser />
    </SectionItem>
  </Section>
);

export default AdminContent;
