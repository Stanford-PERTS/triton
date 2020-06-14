import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'components/Icon';
import Link from 'components/Link';
import SectionButton from 'components/SectionButton';

const AddButton = ({ to, dark = true }) => (
  <Link to={to} title="Add New" Component={SectionButton} dark={dark}>
    <span>Add</span> <Icon names="plus-circle" />
  </Link>
);

export default AddButton;

AddButton.propTypes = {
  // route to link to
  to: PropTypes.string.isRequired,
};
