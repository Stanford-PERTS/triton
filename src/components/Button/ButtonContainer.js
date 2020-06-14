import styled, { css } from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  ${props =>
    props.horizontal &&
    css`
      flex-direction: row;
    `};

  & button,
  & button:active {
    width: auto;
    margin: 5px;
  }
`;

export default ButtonContainer;
