import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';

import CardRow from './CardRow';
import CardContent, { CardContentStyled } from './CardContent';
import CardHeader from './CardHeader';
import theme from 'components/theme';

export default class Card extends React.Component {
  static propTypes = {
    // A Card can center itself inside its container.
    centered: PropTypes.bool,

    // Primary content.
    children: PropTypes.node,

    // Additional classes.
    className: PropTypes.string,

    // A Card can be formatted with a disabled theme.
    disabled: PropTypes.bool,

    // A Card can be formatted with a flat theme.
    flat: PropTypes.bool,

    // A Card can be formatted to take up the width of its container.
    fluid: PropTypes.bool,
  };

  static Content = CardContent;
  static Header = CardHeader;
  static Row = CardRow;

  render() {
    const {
      centered,
      children,
      className,
      disabled,
      flat,
      fluid,
      transparent,
    } = this.props;
    const propsCardStyled = {
      centered,
      className,
      disabled,
      flat,
      fluid,
      transparent,
    };

    return <CardStyled {...propsCardStyled}>{children}</CardStyled>;
  }
}

const CardStyled = styled.div`
  margin-bottom: 20px;

  background: ${theme.palette.white};
  border: 0;
  border-radius: ${theme.units.borderRadius};
  box-shadow: ${theme.boxShadow};

  img {
    max-width: 100%;
  }

  /* Contain children elements to parents border-radius defined area. */
  > :first-child {
    border-radius: ${theme.units.borderRadius} ${theme.units.borderRadius} 0 0;
  }

  > :last-child {
    border-radius: 0 0 ${theme.units.borderRadius} ${theme.units.borderRadius};
  }

  > :only-child {
    border-radius: ${theme.units.borderRadius};
  }

  /* Optional styles triggered by props. */
  ${props =>
    props.centered &&
    css`
      margin-left: auto;
      margin-right: auto;
    `};

  ${props =>
    props.disabled &&
    css`
      box-shadow: none;

      ${CardContentStyled} {
        background-color: ${theme.palette.lightGray};
      }
    `};

  ${props =>
    props.flat &&
    css`
      box-shadow: none;
    `};

  ${props =>
    props.fluid &&
    css`
      width: 100%;
    `};

  ${props =>
    props.transparent &&
    css`
      box-shadow: none;
    `};
`;
