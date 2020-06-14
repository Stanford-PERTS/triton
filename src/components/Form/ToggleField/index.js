// ToggleField handles `checkbox` type fields. Similar to BooleanField but
// looks like a toggle switch instead of a checkbox.

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled, { css } from 'styled-components';

import Link from 'components/Link';
import theme from 'components/theme';

export const ToggleFieldStyled = styled.div`
  /*
    Adapted the toggle checkbox concept from
    http://callmenick.com/post/css-toggle-switch-examples
   */

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;

  /* Hide actual checkbox off screen */
  .ToggleFieldElements input {
    position: absolute;
    margin-left: -9999px;
    visibility: hidden;
  }

  .ToggleFieldElements span {
    position: absolute;
    margin-left: -9999px;
    visibility: hidden;
  }

  /* The UI element to be interacted with */
  .ToggleFieldToggle {
    display: block;
    position: relative;
    cursor: pointer;
    outline: none;
    user-select: none;

    padding: 2px;
    width: 70px;
    height: 34px;

    background-color: ${theme.red};
    border-radius: 60px;
    transition: background 0.4s;
  }

  .ToggleFieldToggle:before,
  .ToggleFieldToggle:after {
    display: block;
    position: absolute;
    content: '';
  }

  .ToggleFieldToggle:before {
    top: 2px;
    right: 2px;
    bottom: 2px;
    left: 2px;
    background-color: #ffffff;
    border-radius: 60px;
    transition: background 0.4s;
  }

  .ToggleFieldToggle:after {
    top: 4px;
    left: 4px;
    bottom: 4px;
    width: 26px;
    background-color: ${theme.red};
    border-radius: 52px;
    transition: margin 0.4s, background 0.4s;
  }

  input.ToggleFieldInput.checked + .ToggleFieldToggle {
    background-color: ${theme.green};
  }

  input.ToggleFieldInput.checked + .ToggleFieldToggle:after {
    background-color: ${theme.green};
    margin-left: 36px;
  }

  ${props =>
    props.disabled &&
    css`
      .ToggleFieldToggle {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Make disabled toggles gray. */
      /* Selectors are in this order: */
      /* unchecked, border */
      /* checked, border */
      /* checked or unchecked, slider */
      .ToggleFieldToggle,
      input.ToggleFieldInput.checked + .ToggleFieldToggle,
      input.ToggleFieldInput + .ToggleFieldToggle:after {
        background-color: ${theme.gray};
      }
    `};
`;

const ToggleField = ({
  className,
  disabled,
  input,
  label = '',
  to,
  target,
}) => {
  const labelVisible = to ? (
    <Link to={to} target={target}>
      {label}
    </Link>
  ) : (
    label
  );

  return (
    <ToggleFieldStyled
      className={classnames('checkbox', className)}
      disabled={disabled}
    >
      {/* Visible label */}
      {labelVisible && (
        <div className="ToggleFieldLabel visible">{labelVisible}</div>
      )}

      <label className="ToggleFieldElements">
        {label && <span>{label}</span>}

        <input
          {...input}
          className={`ToggleFieldInput ${input.value && 'checked'}`}
          disabled={disabled}
          checked={input.value}
          type="checkbox"
        />

        <div className="ToggleFieldToggle" />
      </label>
    </ToggleFieldStyled>
  );
};

export default ToggleField;

ToggleField.propTypes = {
  // redux-form input object
  input: PropTypes.object.isRequired,
  // Text label of the input field
  label: PropTypes.string,
  // Option, route to link to
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // Optional
  target: PropTypes.string,
};
