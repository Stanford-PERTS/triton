import React from 'react';
import styled, { css } from 'styled-components/macro';

import Link from 'components/Link';
import theme from 'components/theme';
import { CardContentIconStyled } from './CardContentIcon';

interface CardContentLinkProps {
  centered?: boolean;
  disabled?: boolean;
  rounded?: boolean;
}

const LinkFilter = ({ centered, rounded, ...linkProps }) => (
  <Link {...linkProps} />
);

const CardContentLink = styled(LinkFilter)`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 10px 40px;
  width: 100%;

  border-top: 2px solid ${theme.palette.lightGray};

  color: ${theme.palette.secondary};

  // Link text that goes to three or more lines should still have some margin.
  // Should not apply to circle/chevron.
  > :first-child {
    margin-top: 6px;
    margin-bottom: 6px;
  }

  > :not(:last-child) {
    margin-right: 20px;
  }

  ${(props: CardContentLinkProps) =>
    props.centered &&
    css`
      text-align: center;
    `};

  ${(props: CardContentLinkProps) =>
    props.disabled &&
    css`
      pointer-events: none;
    `};

  ${(props: CardContentLinkProps) =>
    props.rounded &&
    css`
      border-radius: ${theme.units.borderRadius};
    `};

  &:hover,
  &:focus {
    color: ${theme.palette.white};
    background: ${theme.palette.primary};

    ${CardContentIconStyled} {
      color: ${theme.palette.primary};
      background: white;
    }
  }

  &:focus,
  &:hover {
    text-decoration: none;
  }

  /* suppress any external link icon; see Link */
  &:after {
    display: none;
  }
`;

export default CardContentLink;
