import React from 'react';
import PropTypes from 'prop-types';

import './styles.css';

const SelectField = props => {
  const {
    options, // [[value, text], [value, text]]
    input,
    label,
    meta: { touched, error },
  } = props;

  const inputId = `${input.name}-field`;

  return (
    <div className="SelectField">
      <div className="SelectFieldLabel">
        <label htmlFor={inputId}>{label}</label>
      </div>
      <div className="SelectFieldInput">
        <select
          {...input}
          id={inputId}
          className={touched && error ? 'error' : null}
        >
          {options.map(([optionValue, optionText], i) => (
            <option key={optionValue || i} value={optionValue}>
              {optionText || ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

SelectField.propTypes = {
  options: PropTypes.array.isRequired,
};

export default SelectField;
