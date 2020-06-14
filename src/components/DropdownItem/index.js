import styled from 'styled-components';
import theme from 'components/theme';

export default styled.div`
  padding: 20px;

  white-space: nowrap;
  text-transform: uppercase;

  &:not(:last-child) {
    border-bottom: 2px solid ${theme.palette.lightGray};
  }

  color: ${theme.palette.primary};

  a {
    color: ${theme.palette.primary};

    &:hover {
      color: ${theme.palette.primary};
    }
  }
`;
