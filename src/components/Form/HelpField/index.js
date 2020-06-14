/* HelpField handles custom help message. */

import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

const HelpField = ({ children }) =>
  children ? <div className="FieldHelp">{children}</div> : null;

export default HelpField;

HelpField.propTypes = {
  // Optional, help message
  children: PropTypes.node,
};
