import styled from 'styled-components';
import theme from 'components/theme';
import { NavLink } from 'react-router-dom';

export default styled(NavLink)`
  padding: 14px;
  display: flex;
  align-items: center;

  border-top-left-radius: ${theme.units.borderRadius};
  border-bottom-left-radius: ${theme.units.borderRadius};

  color: ${theme.palette.primary};

  &:hover {
    color: ${theme.palette.primary};
  }

  &.active {
    background: ${theme.palette.secondaryDark};
    color: ${theme.palette.white};
  }

  &:focus {
    // antd adds a text-decoration: underline to this rule, override it here
    text-decoration: none;
    outline: 0;
    box-shadow: ${theme.boxShadowFocusInverse};
  }
`;
