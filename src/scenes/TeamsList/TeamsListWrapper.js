import React from 'react';

import Section from 'components/Section';

const TeamsListWrapper = ({ children, title, newTeamRoute }) => (
  <Section dark title={title} to={newTeamRoute} className="TeamsList">
    {children}
  </Section>
);

export default TeamsListWrapper;
