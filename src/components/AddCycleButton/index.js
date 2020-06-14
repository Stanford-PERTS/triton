import React from 'react';
import styled, { css } from 'styled-components';

import theme from 'components/theme';
import HelpMeIcon from 'components/HelpMeIcon';
import Icon from 'components/Icon';
import MenuItem from 'components/MenuItem';
import MenuItemIcon from 'components/MenuItemIcon';
import MenuItemText from 'components/MenuItemText';
import Show from 'components/Show';

const AddCycleButtonStyled = styled.button`
  margin-left: 44px;

  font-size: 12px;
  font-weight: 700;

  border: 1px solid ${theme.gray};
  border-radius: ${theme.units.borderRadius};

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: rgba(255, 255, 255, 0.05);

  cursor: pointer;

  > :not(:first-child) {
    /* This overrides the margin-left in MenuItemText. */
    margin-left: 4px;
  }

  &:focus {
    outline: 0;
    box-shadow: ${theme.boxShadowFocusInverse};
  }

  /*
    We're unable to pass disable to this button when it's disabled because that
    prevents the HelpMeIcon mouse hover effect from working. Instead we'll
    disable the button by using styled-component's as prop and render this as
    a span instead. This causes the "button" to no longer be focusable.
  */
  ${props =>
    props.onClick === null &&
    css`
      /* Indicate that we cannot interact with this button. */
      cursor: not-allowed;

      /*
        For some reason, when the button is rendered as a span, it's growing to
        100% and needs some right margin to look nice. This feels hacky, but I'm
        having trouble locating the style that is causing this, so this works.
      */
      margin-right: 12px;
    `};
`;

const AddCycleButton = ({ disabled = false, disabledText = '', onClick }) => {
  const onClickHandler = disabled ? null : onClick;

  return (
    <MenuItem>
      <AddCycleButtonStyled onClick={onClickHandler} as={disabled && 'span'}>
        <MenuItemIcon>
          <Icon names="plus" fixedWidth />
        </MenuItemIcon>
        <MenuItemText>Add Cycle</MenuItemText>
        <Show when={disabled}>
          <MenuItemIcon>
            <HelpMeIcon>{disabledText}</HelpMeIcon>
          </MenuItemIcon>
        </Show>
      </AddCycleButtonStyled>
    </MenuItem>
  );
};

export default AddCycleButton;
