import styled from 'styled-components';
import theme from 'components/theme';
import MenuItem from 'components/MenuItem';
import MenuLink from 'components/MenuLink';
import MenuItemIcon from 'components/MenuItemIcon';
import MenuItemText from 'components/MenuItemText';

export default styled.div`
  margin-top: -14px;
  margin-left: 72px;

  ${MenuItem} {
    margin: 2px 0 0 0;
  }

  /* For the "Add New Cycle" menu item */
  ${MenuItem}.add {
    margin-left: 36px;
    margin-right: 24px;
  }

  ${MenuLink} {
    padding: 8px;
  }

  ${MenuItemIcon} {
    min-width: 22px;
    color: ${theme.palette.primary};
  }

  ${MenuItemText} {
    text-transform: none;
    color: #aeb9d7;
  }
`;
