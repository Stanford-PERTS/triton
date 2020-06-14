import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import Icon from 'components/Icon';

const ChevronIconCircle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-basis: 54px;
  min-width: 54px;
  height: 54px;
  border-radius: 50%;

  color: ${theme.palette.primary};
  background: ${theme.palette.mediumGray};
`;

const ChevronIconStyled = styled(Icon)`
  font-size: 20px !important;
  font-weight: thin;
`;

const SectionItemChevron = () => (
  <ChevronIconCircle>
    <ChevronIconStyled names="angle-right" />
  </ChevronIconCircle>
);

export default SectionItemChevron;
