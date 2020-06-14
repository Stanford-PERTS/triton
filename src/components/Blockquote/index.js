import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';

const Citation = styled.div`
  margin-top: 10px;
  text-align: right;
  font-size: 12px;
  word-break: break-all; /* to keep emdash and initial content on same line */
`;

const BlockquoteStyled = styled.blockquote`
  // This blockquote wants to manage its own margins, so it can align
  // its colored left border, even if it's part of a flex container that
  // manages margins for its children. So raise the specificity of the base
  // selector.
  blockquote& {
    color: ${theme.secondary};
    border-left: 4px solid ${theme.primary};
    position: relative;
    font-size: 12px;
    padding: 0 30px 0 20px;
    margin-left: 16px;
  }

  &:before {
    position: absolute;
    left: -20px;
    content: '“';
    font-size: 64px;
    background-color: white;
    padding-top: 15px;
    line-height: 20px;
    color: ${theme.primary};
    font-family: Georgia, serif;
  }
`;

/**
 * Stylish block quote with colored left border and decorative quotation mark.
 * @param  {React.Children} props.children  quote text
 * @param  {string}         props.cite      optional citation text, to appear
 *     below the quote
 * @return {React.Component} to render
 */
const Blockquote = ({ children, cite }) => (
  <BlockquoteStyled>
    {children}
    {cite && <Citation>&mdash; {cite}</Citation>}
  </BlockquoteStyled>
);

export default Blockquote;
