import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import theme from 'components/theme';

export const PageNavLinkStyled = styled.span`
  padding: 3px 5px;

  color: ${theme.darkGray};
  text-decoration: none;

  ${props =>
    props.active &&
    css`
      text-decoration: underline;
    `};

  ${props =>
    props.disabled &&
    css`
      color: ${theme.gray};
      cursor: default;
      pointer-events: none;
    `};
`;

const PageNavLink = ({ to, active, disabled, children, ...props }) => (
  <PageNavLinkStyled disabled={disabled} active={active}>
    <Link {...props} to={to} disabled={disabled}>
      {children}
    </Link>
  </PageNavLinkStyled>
);

export default PageNavLink;
