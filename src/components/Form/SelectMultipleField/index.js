import React from 'react';
import PropTypes from 'prop-types';
import { change, touch } from 'redux-form';
import styled from 'styled-components';
import InputField from 'components/Form/InputField';

const Checkbox = styled.div``;

const CheckboxInput = styled.input``;

const CheckboxLabel = styled.label`
  margin-left: 12px;
`;

const CheckboxSelectField = props => {
  const {
    options = [],
    input: { name, value = [] },
    meta: { dispatch, form },
  } = props;

  const inputId = `${name}-field`;

  const onChange = event => {
    // Dispatch a touch action so that errors will display.
    dispatch(touch(form, name));

    // Dispatch redux-form change actions to update the values selected/checked.
    // - utilizing Set to avoid duplicates
    // - storing the selected options as an array of the option values
    const valueSet = new Set([...value]);

    if (event.target.checked) {
      valueSet.add(event.target.value);
      dispatch(change(form, name, [...valueSet]));
    } else {
      valueSet.delete(event.target.value);
      dispatch(change(form, name, [...valueSet]));
    }
  };

  return (
    <InputField {...props}>
      <div className="CheckboxSelectFieldInput">
        {options.map((option, index) => {
          const optionId = `${inputId}-${option.value}`;
          return (
            <Checkbox key={index}>
              <CheckboxInput
                type="checkbox"
                id={optionId}
                value={option.value}
                checked={value.indexOf(option.value) !== -1}
                onChange={onChange}
              />
              <CheckboxLabel htmlFor={optionId}>{option.label}</CheckboxLabel>
            </Checkbox>
          );
        })}
      </div>
    </InputField>
  );
};

CheckboxSelectField.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
    }),
  ),
};

export default CheckboxSelectField;
