/* BooleanField handles `checkbox` type fields */

import React from 'react';
import classnames from 'classnames';

import './styles.css';

const BooleanField = ({ className, disabled, id, input, label }) => (
  <div className={classnames('BooleanField', className)}>
    <div className="BooleanFieldLabel">
      <label htmlFor={id}>{label}</label>
    </div>
    <div className="BooleanFieldInput">
      <input
        id={id}
        disabled={disabled}
        {...input}
        type="checkbox"
        checked={input.value}
      />
    </div>
  </div>
);

export default BooleanField;
