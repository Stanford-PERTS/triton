import React from 'react';
// import PropTypes from 'prop-types';

import Icon from 'components/Icon';
import SectionButton from 'components/SectionButton';

const SectionDeleteButton = props => (
  <SectionButton onClick={props.onClick} disabled={props.disabled}>
    <Icon names="trash" />
  </SectionButton>
);

export default SectionDeleteButton;

SectionDeleteButton.propTypes = {};
