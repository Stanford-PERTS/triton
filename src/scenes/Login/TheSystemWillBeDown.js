// https://github.com/PERTS/triton/issues/1200
//   Notice that will appear on /login to let users know that the system
//   will be down for maintenance. https://www.youtube.com/watch?v=JwZwkk7q25I

import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';

const TheSystemWillBeDown = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: ${theme.palette.white};
  color: ${theme.palette.secondaryDark};
  z-index: 100;
  text-align: center;
  padding: 10px;
`;

export default () => (
  <TheSystemWillBeDown>
    Copilot will be closed for maintenance for 3 hours on Saturday, November 2
    <sup>nd</sup>, at 8pm pacific time.
    {/*
    PERTS websites will be closed for maintenance for 2 hours on Sunday, April
    28th, at 4pm pacific time.
    */}
  </TheSystemWillBeDown>
);
