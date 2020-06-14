import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import pertsLogoBoxWhite from './pertsLogoBoxWhite.png';

// top/bottom margin applied to logo box button
const logoBoxMargin = '10px';

const LogoBoxStyled = styled.img`
  margin: ${logoBoxMargin} 0;
  height: calc(${theme.units.appBarHeight} - (2 * ${logoBoxMargin}));

  background: ${theme.palette.primaryLight};

  border: 1px solid ${theme.palette.white};
  border-radius: ${theme.units.borderRadius};
`;

export default () => (
  <LogoBoxStyled
    alt="PERTS logo, toggle navigation bar"
    src={pertsLogoBoxWhite}
  />
);
