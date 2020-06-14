import React from 'react';

import Icon from 'components/Icon';
import Link from 'components/Link';
import SectionButton from 'components/SectionButton';

const SectionToButton = ({ to }) => (
  <Link to={to}>
    <SectionButton>
      <Icon names="chevron-right" />
    </SectionButton>
  </Link>
);

export default SectionToButton;
