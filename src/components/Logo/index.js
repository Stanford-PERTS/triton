import React from 'react';
import styled from 'styled-components';
import pertsLogoWhite from './pertsLogoWhite.png';

const LogoStyled = styled.img`
  height: inherit;
`;

export default () => <LogoStyled alt="Copilot" src={pertsLogoWhite} />;
