import styled, { css } from 'styled-components';
import theme from 'components/theme';

const StyledButton = styled.button`
  /* COMMON STYLES */
  display: inline-block;
  position: relative;

  width: 100%;
  min-height: 38px;

  border: 0;
  border-radius: 3px;

  &:focus {
    outline: 0;
    box-shadow: ${theme.boxShadowFocus};
  }

  padding: 5px 30px;

  box-shadow: 1px 1px 1px 0px rgba(74, 74, 74, 0.5);

  font-size: 14px;
  font-weight: 600;

  /*
    This right/bottom margin, is needed to make up for the movement that occurs
    when the button is clicked.
  */
  margin: 0 1px 1px 0;

  /*
    Make children clip to border-radius. This clips the loading indicator so
    that it respects the border-radius of the button.
   */
  /* https://stackoverflow.com/questions/3714862/forcing-child-to-obey-parents-curved-borders-in-css */
  overflow: hidden;

  /* Active/pressed button effect */
  :active {
    margin: 1px 0 0 1px;
    box-shadow: none;
  }

  /* DEFAULT STYLES */
  border: 1px solid ${theme.primary};
  background: ${theme.primary};
  color: ${theme.white};

  /* OVERRIDE STYLES */
  ${props =>
    props.secondary &&
    css`
      border: 1px solid ${theme.secondary};
      background: ${theme.secondary};
      color: ${theme.white};
    `};

  ${props =>
    props.cancel &&
    css`
      border: 1px solid ${theme.darkGray};
      background: ${theme.white};
      color: ${theme.darkGray};
    `};

  ${props =>
    props.danger &&
    css`
      border: 1px solid ${theme.danger};
      background: ${theme.white};
      color: ${theme.danger};
    `};

  ${props =>
    props.caution &&
    css`
      border: 1px solid ${theme.caution};
      background: ${theme.caution};
      color: ${theme.white};
    `};

  ${props =>
    props.disabled &&
    css`
      border: 1px solid ${theme.mediumGray};
      background: ${theme.mediumGray};
      color: ${theme.darkGray};
    `};

  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  pointer-events: ${props => props.disabled && 'none'};
`;

export default StyledButton;
