import styled, { css } from 'styled-components/macro';
import theme from 'components/theme';

export default styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 40px;
  height: 40px;

  background: ${theme.palette.primaryLight};
  color: ${theme.palette.white};

  border: 1px solid ${theme.palette.white};
  border-radius: ${theme.units.borderRadius};

  ${props =>
    props.pointer !== false &&
    css`
      cursor: pointer;
    `};

  font-size: 20px;

  &:focus {
    outline: 0;
    box-shadow: ${theme.boxShadowFocusInverse};
  }

  &:hover {
    color: ${theme.palette.white};
  }
`;
