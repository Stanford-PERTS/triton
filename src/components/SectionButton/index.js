import styled, { css } from 'styled-components';
import theme from 'components/theme';
import { IconStyled } from 'components/Icon';

const SectionButton = styled.button`
  padding: 10px 15px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: ${theme.units.borderRadius};
  cursor: pointer;

  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;

  > :not(:first-child) {
    margin-left: ${theme.units.buttonMargin};
  }

  &:focus {
    box-shadow: ${theme.boxShadowFocus};
    outline: 0;
    text-decoration: none;
  }

  /* default, light theme */
  border: 1px solid ${theme.palette.secondary};
  background: ${theme.palette.white};
  color: ${theme.palette.secondary};

  &:hover {
    color: ${theme.palette.secondary};
  }

  ${IconStyled} {
    color: ${theme.palette.secondary};
    font-size: 18px;
  }

  ${props =>
    props.dark &&
    css`
      border: 1px solid ${theme.palette.white};
      background: ${theme.palette.secondaryLight};
      color: ${theme.palette.white};

      &:focus {
        box-shadow: ${theme.boxShadowFocusInverse};
        outline: 0;
        text-decoration: none;
      }

      &:hover {
        color: ${theme.palette.white};
      }

      ${IconStyled} {
        color: ${theme.palette.white};
        font-size: 18px;
      }
    `};

  ${props =>
    props.disabled &&
    css`
      background: ${theme.palette.lightGray};
      border-color: ${theme.palette.gray};
      cursor: default;

      ${IconStyled} {
        color: ${theme.palette.gray};
      }
    `};

  ${props =>
    props.dark &&
    props.disabled &&
    css`
      display: none;
    `};

  /* dark theme */
  /* overrides are handled in Section component styles */
`;

SectionButton.displayName = 'SectionButton';
export default SectionButton;
