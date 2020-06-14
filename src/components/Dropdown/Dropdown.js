import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';

import DropdownHeader from './DropdownHeader';
import DropdownItem from './DropdownItem';
import DropdownMenu from './DropdownMenu';

import Icon from 'components/Icon';

// Heavily inspired by https://react.semantic-ui.com/modules/dropdown
// We may want to look into using this, or something like it down the line

const DropdownContainer = styled.span`
  padding: 0 5px;

  position: relative;

  cursor: pointer;
  text-align: left;

  /* Add space between dropdown text and icon. */
  > :not(:first-child) {
    margin-left: 6px;
  }

  /* Indicate dropdown is disabled. */
  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.8;
    `};

  /* Allow dropdown hover when not disabled. */
  ${props =>
    !props.disabled &&
    css`
      &:hover {
        > ${DropdownMenu} {
          display: block;
        }
      }
    `}
`;

const DropdownText = styled.span``;

class Dropdown extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    text: PropTypes.string,
  };

  // Allows Dropdown to behave as single module where subcomponents are
  // accessed through main Dropdown component - e.g. Dropdown.Header, etc.
  static Header = DropdownHeader;
  static Item = DropdownItem;
  static Menu = DropdownMenu;

  render() {
    const { children, icon, text, ...containerProps } = this.props;

    return (
      <DropdownContainer {...containerProps}>
        <DropdownText>{text}</DropdownText>
        <Icon names={icon} />
        {children}
      </DropdownContainer>
    );
  }
}

Dropdown.defaultProps = {
  icon: 'ellipsis-v',
};

export default Dropdown;
