import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';

import { IconStyled } from 'components/Icon';
import SectionButton from 'components/SectionButton';
import theme from 'components/theme';

export default class CardHeader extends React.Component {
  static propTypes = {
    // Title.
    children: PropTypes.node,

    // Additional classes.
    className: PropTypes.string,

    // A CardHeader can be formatted with a danger theme.
    danger: PropTypes.bool,

    // A CardHeader can be formatted with a dark theme.
    dark: PropTypes.bool,

    // A CardHeader with a dark border and white background.
    transparent: PropTypes.bool,

    // Component to display in the left slot of header.
    left: PropTypes.node,

    // Component to display in the right slot of the header.
    right: PropTypes.node,

    // A CardHeader can be formatted with Task styles.
    task: PropTypes.bool,
  };

  render() {
    const {
      children,
      className,
      danger,
      dark,
      transparent,
      left,
      right,
      task,
    } = this.props;
    const propsCardHeaderStyled = {
      danger,
      dark,
      transparent,
      task,
      className,
    };

    return (
      <CardHeaderStyled {...propsCardHeaderStyled}>
        <CardHeaderLeftStyled>{left}</CardHeaderLeftStyled>
        <CardHeaderTitleStyled>{children}</CardHeaderTitleStyled>
        <CardHeaderRightStyled>{right}</CardHeaderRightStyled>
      </CardHeaderStyled>
    );
  }
}

const CardHeaderLeftStyled = styled.div`
  min-width: 124px;
  display: flex;
  justify-content: flex-start;
`;

const CardHeaderTitleStyled = styled.div`
  flex-grow: 1;
  text-align: center;
`;

const CardHeaderRightStyled = styled.div`
  min-width: 124px;
  display: flex;
  justify-content: flex-end;

  > :not(:first-child) {
    margin-left: 6px;
  }
`;

const CardHeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 6px;
  min-height: 50px;

  background: ${theme.palette.mediumGray};
  color: ${theme.palette.secondary};

  text-transform: uppercase;
  font-weight: bold;

  > :not(:first-child) {
    margin-left: 6px;
  }

  + * {
    /* No border is needed after a CardHeader. */
    border-top: 0 !important;
  }

  ${props =>
    props.danger &&
    css`
      background: ${theme.palette.red};
      color: ${theme.palette.white};

      ${SectionButton} {
        border: 1px solid ${theme.palette.white};
        background: ${theme.palette.mediumGray};
        color: ${theme.palette.white};

        ${IconStyled} {
          color: ${theme.palette.white};
          font-size: 18px;
        }
      }
    `};

  ${props =>
    props.dark &&
    css`
      background: ${theme.palette.secondary};
      color: ${theme.palette.white};
    `};

  ${props =>
    props.transparent &&
    css`
      background: transparent;
      box-shadow: none;
    `};

  ${props =>
    props.task &&
    css`
      padding: 6px 12px;

      ${CardHeaderLeftStyled} {
        min-width: 21px;

        i {
          font-size: 24px;
        }
      }

      ${CardHeaderTitleStyled} {
        text-align: left;
      }
    `};
`;
