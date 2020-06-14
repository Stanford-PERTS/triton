import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
  ${props =>
    props.applytextdecoration === 'true' &&
    css`
      &:focus,
      &:hover {
        text-decoration: underline;
      }
    `};
`;

const ReactRouterLink = props => {
  // Add props/attributes to filter out. Only `linkProps` are passed along.
  // https://reactjs.org/blog/2017/09/08/dom-attributes-in-react-16.html#changes-in-detail
  const { Component, as, dark, externalLink, ...linkProps } = props;

  // In cases where the `Link` component is used with the custom `Component`
  // prop, that component should handle custom :focus and :hover styles.
  const applyTextDecoration = Component ? 'false' : 'true';

  return (
    <StyledLink {...linkProps} applytextdecoration={applyTextDecoration} />
  );
};

export default ReactRouterLink;
