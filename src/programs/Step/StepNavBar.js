import React from 'react';
import styled from 'styled-components';

import Icon from 'components/Icon';
import Link from 'components/Link';
import SceneTitle from 'components/SceneTitle';
import SectionButton from 'components/SectionButton';

const StyledIconRight = styled(Icon)`
  margin-left: 8px;
`;

const StyledIconLeft = styled(Icon)`
  margin-right: 8px;
`;

const StepNavBar = ({ title, toPrevious, toNext }) => (
  <SceneTitle
    title={title}
    left={
      toPrevious && (
        <Link to={toPrevious} Component={SectionButton} dark>
          <StyledIconLeft names="angle-left" />
          Previous
        </Link>
      )
    }
    right={
      toNext && (
        <Link to={toNext} Component={SectionButton} dark>
          Next
          <StyledIconRight names="angle-right" />
        </Link>
      )
    }
  />
);

export default StepNavBar;
