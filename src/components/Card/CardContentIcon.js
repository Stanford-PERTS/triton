import React from 'react';
import styled from 'styled-components/macro';
import theme from 'components/theme';

import Icon from 'components/Icon';

const CardContentIcon = ({ icon }) => (
  <div>
    {/*
      This wrapping div makes the aspect-ratio-preserving rules in
      CardContentIconStyled work correctly.
      See https://bryanhadaway.com/how-to-create-circles-with-css/
    */}
    <CardContentIconStyled>
      <IconStyled names={icon} />
    </CardContentIconStyled>
  </div>
);

export default CardContentIcon;

const IconStyled = styled(Icon)`
  font-size: 48px !important;
  font-weight: normal;
`;

export const CardContentIconStyled = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  /* keep circular */
  width: 100%;
  height: 0px;
  padding: 50% 0;

  flex-basis: 90px;
  border-radius: 50%;

  margin-right: 20px;

  color: white;
  background: ${theme.palette.primary};
`;
