import styled from 'styled-components';
import theme from 'components/theme';

const TabsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 10px;

  border: 1px solid ${theme.primary};
  border-radius: 3px;

  a {
    display: flex;
    flex-basis: 0;
    flex-grow: 1;
    align-items: center;
    justify-content: center;

    height: 30px;

    color: ${theme.primary};
    text-decoration: none;

    border-right: 1px solid ${theme.primary};

    &:last-child {
      border-right: 0;
    }

    &.active {
      color: ${theme.white};
      background: ${theme.primary};
    }
  }
`;

export default TabsStyled;
