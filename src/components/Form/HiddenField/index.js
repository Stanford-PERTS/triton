import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Field } from 'redux-form';

import './styles.css';

const HiddenField = props => {
  const { className, ...rest } = props;
  const classes = classnames('HiddenField', className);

  return <Field {...rest} className={classes} />;
};

HiddenField.propTypes = {
  className: PropTypes.string,
};

export default HiddenField;
