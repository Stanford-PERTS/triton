// Font-Awesome icon wrapper component
//
// Example use:
//
//   <Icon names="gear" />

import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import classnames from 'classnames';

export const IconStyled = styled.i`
  display: inline-block;
  font-size: 1em;
  opacity: 1;
  text-decoration: none;

  /* Using a class vs styled props because there's a conflict with antd */
  &.hidden {
    visibility: hidden;
  }

  ${props =>
    props.link &&
    css`
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.1s ease;

      &:hover {
        opacity: 1;
      }
    `};

  /*
    Adjustment for https://github.com/PERTS/triton/issues/1111
    Different font-awesome characters can have different sizes, and will sit
    differently within the <i> tag. This adjusts for the chevron-left.
   */
  &.fa-chevron-left {
    margin-left: -2px;
  }
`;

const Icon = ({ className = '', names, hidden = false, ...rest }) => {
  // Font-Awesome class names are passed in on the `names` prop
  // Example: `chevron-left` becomes `fa-chevron-left`, `gear` becomes `fa-gear`
  const faClassNames = names.split(' ').map(n => `fa-${n}`);

  const classes = classnames(
    'fa', // `fa` is required by font-awesome
    ...faClassNames,
    hidden && 'hidden',
    className,
  );

  return <IconStyled {...rest} className={classes} />;
};

Icon.propTypes = {
  // Font-Awesome class names, see comment above
  names: PropTypes.string.isRequired,
  // Optional: extra class names
  className: PropTypes.string,
  // Optional: styles as a link
  link: PropTypes.bool,
  // Optional: adds `visibility: hidden` style
  hidden: PropTypes.bool,
};

export default Icon;
