import styled, { css } from 'styled-components';

const ExternalAnchor = styled.a`
  &:focus,
  &:hover {
    text-decoration: underline;
  }

  ${props =>
    props.noIcon === true
      ? css`
        &:after{ content: none } }
      `
      : css`
        &:after {
          margin-left: 5px;
          content: '\f08e';
          font: normal normal normal 14px/1 FontAwesome;
          text-rendering: auto;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        `}
`;

export default ExternalAnchor;
