// TEMPORARY
// This is a wrapper component for when we want to use SectionItem but we don't
// want to include it within a Section. TODO @taptapdan Rework the scenes so
// we're organizing in a way where we don't need to do this. We should building
// up our scenes with UI components.

import React from 'react';
import SectionItem from 'components/SectionItem';

import './styles.css';

const SectionItemOrphaned = props => (
  <SectionItem className="SectionItemOrphaned" {...props} />
);

export default SectionItemOrphaned;
