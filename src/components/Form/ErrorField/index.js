/* ErrorField handles custom catch-all form errors. */

import React from 'react';
import './styles.css';

const ErrorField = ({ meta: { error } }) =>
  error ? <div className="FieldError">{error}</div> : null;

export default ErrorField;
