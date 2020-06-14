import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';
import theme from 'components/theme';

import CardContentIcon from './CardContentIcon.js';
import CardContentLink from './CardContentLink';
import CardContentText from './CardContentText';
import ChevronTo from 'components/ChevronTo';

export default class CardContent extends React.Component {
  static propTypes = {
    // Align text center
    centered: PropTypes.bool,

    // Primary content.
    children: PropTypes.node,

    // Additional classes.
    className: PropTypes.string,

    // Disable interactions
    disabled: PropTypes.bool,

    // Icon to display
    icon: PropTypes.string,

    // Stylistically "merge" with CardContent above it.
    merge: PropTypes.bool,

    // Click handler
    onClick: PropTypes.func,

    // Target for link
    target: PropTypes.string,

    // Route to link to
    to: PropTypes.string,

    // If linked route should be treated as external
    externalLink: PropTypes.bool,
  };

  render() {
    const { children, icon, to, ...rest } = this.props;

    return to ? (
      <CardContentLink to={to} {...rest}>
        {icon && <CardContentIcon icon={icon} />}
        <CardContentText>{children}</CardContentText>
        <ChevronTo />
      </CardContentLink>
    ) : (
      <CardContentStyled {...rest}>
        {icon && <CardContentIcon icon={icon} />}
        <CardContentText>{children}</CardContentText>
      </CardContentStyled>
    );
  }
}

export const CardContentStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px 40px;
  @media ${theme.units.multiColumnMaxWidthCollapsed} {
    padding: 16px 16px;
  }
  @media ${theme.units.desktopMinWidth} and ${
  theme.units.multiColumnMaxWidthExpanded
} {
    padding: 16px 16px;
  }

  max-width: 100%;

  border-top: 2px solid ${theme.palette.lightGray};

  table {
    width: 100%;
  }

  > :not(:last-child) {
    margin-right: 20px;
  }

  ${props =>
    props.centered &&
    css`
      text-align: center;
    `};

  ${props =>
    props.merge &&
    css`
      margin-top: -10px;
      padding-top: 0;
      border-top: 0;
    `};

  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
    `};
`;
