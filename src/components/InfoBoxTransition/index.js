// InfoBoxTransition
// Wrapper around InfoBox that uses CSS transitions to bring the content
// in/out when there is/isn't child content.
//
// Usage:
//   Same as InfoBox

import React from 'react';
import { Collapse } from 'react-collapse';
import { presets } from 'react-motion';

import InfoBox from 'components/InfoBox';
import SectionItemOrphaned from 'components/SectionItemOrphaned';

const InfoBoxTransition = props => (
  <Collapse isOpened={Boolean(props.children)} springConfig={presets.stiff}>
    <SectionItemOrphaned>
      <InfoBox {...props} />
    </SectionItemOrphaned>
  </Collapse>
);

export default InfoBoxTransition;
