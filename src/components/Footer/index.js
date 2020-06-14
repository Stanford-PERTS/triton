import styled from 'styled-components';

/**
 * For footnotes with numbered list of citations.
 * @returns {StyledComponent} to render
 */
const Footer = styled.footer`
  padding-top: 20px;
  font-size: 10px;

  ol {
    padding-left: 20px;
  }
`;

export default Footer;
