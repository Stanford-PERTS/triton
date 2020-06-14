import React from 'react';
import PropTypes from 'prop-types';
import entries from 'lodash/entries';
import styled, { css } from 'styled-components';
import theme from 'components/theme';

import InputField from 'components/Form/InputField';

const radioPadding = '12px';
const radioButtonSize = '18px;';

const RadioOption = styled.div`
  margin: 5px;
`;

const RadioOptionSelect = styled.div`
  /* pseudo radio option ui circle */
  min-height: ${radioButtonSize};
  min-width: ${radioButtonSize};
  border: 3px solid ${theme.palette.primary};
  border-radius: 50%;
`;

const RadioOptionLabel = styled.label`
  width: 100%;
  height: 100%;
  flex-grow: 1;

  padding: ${radioPadding};

  border: 1px solid ${theme.palette.mediumGray};
  border-radius: ${theme.units.borderRadius};

  &:hover {
    cursor: pointer;
    border: 1px solid ${theme.palette.gray};
  }

  &:active {
    border: 1px solid ${theme.palette.primary};
  }

  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RadioOptionText = styled.div`
  /*
    For column display, this grows the text of the label so all of the option
    circles line up vertically.
  */
  flex-grow: 1;
`;

const RadioOptionInput = styled.input`
  /*
    Hide the browser default input UI. Don't use 'display: hidden' or
    'visibility: hidden' because then the input fields will be removed from the
    flow of the page and ignored by screen readers.
  */
  opacity: 0;
  /*
    Absolute so the hidden radio fields doesn't displace other elements.
  */
  position: absolute;

  /* Styles for checked/selected option. */
  &:checked + label {
    border: 1px solid ${theme.palette.primary};

    ${RadioOptionSelect} {
      background: ${theme.palette.primary};
    }
  }

  /* Add focus effect for keyboard users. */
  &:focus + label {
    box-shadow: ${theme.boxShadowFocus};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;

  /* When displayed in column, add right margin to pseudo radio input. */
  ${RadioOptionSelect} {
    margin-right: ${radioPadding};
  }

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;

      label,
      input {
        /*
          Even though we set disabled on the input element, hover and active
          pseudo classes can still activate, so we need to disable pointer
          events.

          You cannot assign a custom cursor to the same element that you've
          set pointer-events: none to (or a child), so adding this at the next
          highest level we can.
        */
        pointer-events: none;
      }

      ${RadioOptionSelect} {
        border-color: ${theme.palette.darkGray};
      }

      input:checked + label {
        border-color: ${theme.palette.darkGray};

        ${RadioOptionSelect} {
          background: ${theme.palette.darkGray};
        }
      }
    `};

  ${props =>
    props.row &&
    css`
      @media screen and ${theme.units.formCollapseMinWidth} {
        flex-direction: row;

        > * {
          /* Options are given equal widths. */
          flex-grow: 1;
          flex-basis: 0;
        }

        label {
          /*
            The pseudo radio input displays below label when displayed as row.
          */
          flex-direction: column-reverse;
          text-align: center;
        }

        /*
          Since pseudo radio input displays below label, add margin top.
        */
        ${RadioOptionSelect} {
          margin-right: 0;
          margin-top: ${radioPadding};
        }
      }
    `};
`;

const inputId = (name, value) =>
  `radio-${name.replace(/\s/g, '')}-${value.replace(/\s/g, '')}`;

const RadioField = props => {
  const { disabled = false, input, options = [], row = false } = props;

  return (
    <InputField {...props}>
      <RadioGroup role="group" row={row} disabled={disabled}>
        {entries(options).map(([oValue, oLabel]) => (
          <RadioOption key={oValue}>
            {/* Spread input prop from redux-form before this input's value. */}
            <RadioOptionInput
              type="radio"
              name={input.name}
              id={inputId(input.name, oValue)}
              {...input}
              value={oValue}
              checked={oValue === input.value}
              disabled={disabled}
            />
            <RadioOptionLabel htmlFor={inputId(input.name, oValue)}>
              <RadioOptionSelect />
              <RadioOptionText>{oLabel}</RadioOptionText>
            </RadioOptionLabel>
          </RadioOption>
        ))}
      </RadioGroup>
    </InputField>
  );
};

RadioField.propTypes = {
  // Flag to set this radio field to disabled.
  disabled: PropTypes.bool,
  // input prop from redux-form.
  input: PropTypes.object.isRequired,
  // The options available for selection.
  // { value1: 'option text 1', value2: 'option text 2' }
  options: PropTypes.object.isRequired,
  // Display options in row format (vs default column).
  row: PropTypes.bool,
};

export default RadioField;
