// InfoBox
//
// Usage:
//   <InfoBox>
//     Text to appear within the InfoBox.
//   </InfoBox>
//
//   <InfoBox success>
//     An InfoBox that indicates a successful result.
//   </InfoBox>
//
//   <InfoBox warning>
//     An InfoBox that indicates the user should pay attention.
//   </InfoBox>
//
//   <InfoBox error>
//     An InfoBox that indicates something has gone wrong, or input is invalid.
//   </InfoBox>

import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import theme from 'components/theme';

const InfoBoxStyled = styled.div`
  display: flex;
  ${props =>
    props.column
      ? css`
          flex-direction: column;
        `
      : css`
          flex-direction: row;
        `};
  justify-content: center;
  align-items: center;

  text-align: center;
  font-size 14px;

  margin: 10px 0;
  padding: 10px 20px;

  border: 1px dashed ${theme.primary};
  border-radius: ${theme.units.borderRadius};

  >:not(:first-child) {
    margin-left: 30px;
  }

  >:last-child {
    margin-bottom: 0;
  }

  ${props =>
    props.dark &&
    css`
      border-color: ${theme.palette.darkGray};
    `};

  ${props =>
    props.success &&
    css`
      border-color: ${theme.success};
      background: ${theme.white};
    `};

  ${props =>
    props.error &&
    css`
      border-color: ${theme.warning};
      background: ${theme.warning};
      color: ${theme.white};
    `};

  ${props =>
    props.warning &&
    css`
      border-color: ${theme.warning};
      border-width: 3px;
    `};

  ${props =>
    props.notrounded &&
    css`
      border-radius: 0;
    `};

  ${props =>
    props.alignLeft &&
    css`
      justify-content: left;
      text-align: left;
    `};
`;

const InfoBox = props => <InfoBoxStyled className="InfoBox" {...props} />;

export default InfoBox;

InfoBox.propTypes = {
  children: PropTypes.node,
  // Set `column` true to set `flex-direction: column`.
  // Default is `flex-direction: row`.
  column: PropTypes.bool,
  // styling options
  dark: PropTypes.bool,
  success: PropTypes.bool,
  warning: PropTypes.bool,
  error: PropTypes.bool,
  notrounded: PropTypes.bool,
};
