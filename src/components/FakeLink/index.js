import styled from 'styled-components';

import theme from 'components/theme';

/**
 * A button that looks like an anchor, but without the href.
 * @type {StyledComponent}
 */
const FakeLink = styled.button`
  cursor: pointer;
  border: none;
  padding: 0;
  background: transparent;
  color: ${theme.palette.dark};

  &:focus,
  &:hover {
    outline: 0;
    text-decoration: underline;
  }
`;

FakeLink.defaultProps = {
  // The default for a link-styled button should not be to submit a form.
  type: 'button',
};

export default FakeLink;
