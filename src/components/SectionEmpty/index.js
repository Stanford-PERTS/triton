import React from 'react';
import PropTypes from 'prop-types';

import GetStarted from 'components/GetStarted';
import SectionItem from 'components/SectionItem';

const SectionEmpty = ({ isEmpty, isLoading, ...props }) =>
  isEmpty && !isLoading ? (
    <SectionItem>
      <GetStarted>
        <p>
          <strong>{props.children}</strong>
        </p>
        <p>
          Click the <strong>Add</strong> button to get started.
        </p>
      </GetStarted>
    </SectionItem>
  ) : (
    <div />
  );

SectionEmpty.propTypes = {
  isEmpty: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default SectionEmpty;
