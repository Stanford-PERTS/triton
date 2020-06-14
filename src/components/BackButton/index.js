// BackButton
// For back navigation buttons in SceneTitle components.
//
// Usage:
//   <SceneTitle
//     title="Report Settings"
//     left={<BackButton to={routes.toTeamReports(teamId)} />}
//   />

import React from 'react';

import SectionButton from 'components/SectionButton';
import Link from 'components/Link';
import Icon from 'components/Icon';

const BackButton = ({ to, label = null }) => (
  <Link to={to} Component={SectionButton} dark aria-label="Back">
    <Icon names="chevron-left" />
    {label && <span>{label}</span>}
  </Link>
);

export default BackButton;
