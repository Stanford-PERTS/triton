import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ButtonLoadingIndicator from './ButtonLoadingIndicator';
import StyledButton from './StyledButton';

/**
 * Adds dynamic loading indicators and text to StyledButton.
 * Note that spreading props is important, because it passes on `className`
 * when applicable, which allows us to apply styled() to any consuming
 * component.
 * @link https://www.styled-components.com/docs/basics#styling-any-components
 * @param {Object} props e.g. children, loading, loadingText, className
 * @returns {Object} Button component
 */
const Button = ({ children, disabled, loading, loadingText, ...props }) => (
  <StyledButton {...props} disabled={disabled || loading}>
    {loading && <ButtonLoadingIndicator />}
    {loading && loadingText ? loadingText : children}
  </StyledButton>
);

export default styled(Button)``;

Button.propTypes = {
  // Text appearing on the button
  children: PropTypes.node.isRequired,

  // button attribute `type`
  type: PropTypes.string,

  // Action taken when button is clicked
  onClick: PropTypes.func,

  // Is button disabled?
  disabled: PropTypes.bool,

  // Is button loading?
  loading: PropTypes.bool,
  // Text to display when loading
  // (For buttons that will have loading, this should be provided.)
  loadingText: PropTypes.node,

  // Optional button type
  cancel: PropTypes.bool,
  // Optional button type
  caution: PropTypes.bool,
  // Option button type
  danger: PropTypes.bool,
  // Optional button type
  secondary: PropTypes.bool,
};

Button.defaultProps = {
  type: 'button',
};
