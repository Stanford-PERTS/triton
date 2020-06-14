import styled, { keyframes } from 'styled-components';

// Styled Components Animations
// https://www.styled-components.com/docs/basics#animations
const progessBarStripes = keyframes`
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
`;

const ButtonLoadingIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  height: 4px;
  background: #4a4a4a;

  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
  animation: ${progessBarStripes} 1s linear infinite;
`;

export default ButtonLoadingIndicator;
