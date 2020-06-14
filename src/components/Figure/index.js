import styled, { css } from 'styled-components';

import theme from 'components/theme';

/**
 * Image with optional figcaption in children to display in a block/column,
 * i.e. not floated.
 * @param  {Object}  props             props
 * @param  {boolean} props.horizontal  as a row
 * @param  {boolean} props.vertical    as a column
 * @param  {boolean} props.small       halves the size
 * @returns {StyledComponent} to render
 */
const Figure = styled.figure`
  text-align: center;
  margin: 0 auto;
  padding-left: 10px;
  padding-right: 10px;

  ${props =>
    props.horizontal &&
    css`
      padding-top: 10px;
      padding-bottom: 20px;
    `};

  img {
    max-width: initial;

    ${props =>
      props.horizontal &&
      (props.small
        ? css`
            width: 200px;
          `
        : css`
            width: 400px;

            @media ${theme.units.mobileMaxWidth} {
              img {
                width: 300px;
              }
            }
          `)};

    ${props =>
      props.vertical &&
      (props.small
        ? css`
            height: 200px;
          `
        : css`
            height: 300px;
          `)};
  }

  h1 {
    font-size: 18px;
  }

  figcaption {
    font-style: italic;
    font-size: 11px;
    padding-top: 10px;

    em {
      font-style: normal;
    }
  }
`;

export default Figure;
