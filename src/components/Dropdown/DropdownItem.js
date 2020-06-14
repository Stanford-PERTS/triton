import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import Icon from 'components/Icon';

const DropdownItemContainer = styled.div`
  display: block;
  position: relative;

  height: auto;
  line-height: 1em;
  padding: 12px 16px;

  font-weight: normal;
  text-align: left;
  cursor: pointer;

  /* Add space between dropdown text and icon. */
  > :not(:first-child) {
    margin-left: 6px;
  }

  /* Fix alignment of icons. Assumption: Using <i> for icons. */
  i {
    min-width: 20px;
    text-align: center;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  ${props =>
    props.disabled &&
    css`
      cursor: default;
      opacity: 0.6;
      pointer-events: none;
    `};
`;

const DropdownItem = ({
  children,
  icon = '',
  text = '',
  ...containerProps
}) => (
  <DropdownItemContainer {...containerProps}>
    {children || (
      <>
        <Icon names={icon} />
        <span>{text}</span>
      </>
    )}
  </DropdownItemContainer>
);

DropdownItem.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  text: PropTypes.string,
};

DropdownItem.defaultProps = {
  onClick: () => null,
};

export default DropdownItem;
