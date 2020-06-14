// requires font-awesome

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Icon from 'components/Icon';

import './styles.css';

const Loading = props => {
  const { children, className, inline } = props;
  const classes = classnames(
    {
      inline,
    },
    'Loading',
    className,
  );

  return (
    <div className={classes}>
      <Icon names="spinner pulse fw" />
      {children || <span>Loading&hellip;</span>}
    </div>
  );
};

export default Loading;

Loading.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  inline: PropTypes.bool,
};
