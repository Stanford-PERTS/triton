import React from 'react';
import PropTypes from 'prop-types';

import Loading from 'components/Loading';
import SectionItem from 'components/SectionItem';

const SectionLoading = ({ isLoading, ...props }) =>
  isLoading ? (
    <SectionItem>
      <Loading>{props.children}</Loading>
    </SectionItem>
  ) : (
    <div />
  );

SectionLoading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default SectionLoading;
