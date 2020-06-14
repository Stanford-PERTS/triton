import styled from 'styled-components/macro';
import theme from 'components/theme';

const DropdownMenu = styled.div`
  display: none;

  position: absolute;
  top: 100%;
  left: auto;
  right: 0;

  margin: 0;
  padding: 0;
  min-width: 180px;

  background-color: ${theme.palette.white};
  text-align: left;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2);
  font-size: 1em;
  z-index: 11;
  cursor: auto;

  > * {
    white-space: nowrap;
  }
`;

export default DropdownMenu;
