// DropdownStyles is a wrapper component for the react-simple-dropdown Dropdown
// component so that we can apply custom styles using styled-components. The
// Dropdown component does not allow for styled-component wrapping
// (`styled(Dropdown)`), presumably, because it doesn't accept `className` as a
// prop.
//
// Usage
//   import Dropdown from 'react-simple-dropdown';
//   import DropdownStyles from 'components/DropdownStyles';
//
//   <DropdownStyles>
//     <Dropdown>
//       ...
//     </Dropdown>
//   </DropdownStyles>

import styled from 'styled-components';
import theme from 'components/theme';
import 'react-simple-dropdown/styles/Dropdown.css';

const DropdownStyles = styled.div`
  .dropdown {
    position: relative;
    display: block;
  }

  .dropdown .dropdown__content {
    position: absolute;
    top: 52px; /* offset to anchor to bottom of ApplicationBar */
    right: 0;

    border-bottom-left-radius: ${theme.units.borderRadius};
    border-bottom-right-radius: ${theme.units.borderRadius};
    box-shadow: ${theme.boxShadow};
    background: ${theme.palette.white};

    margin: 0;
    padding: 0;

    font-size: 14px;
    font-weight: 700;
  }

  .dropdown .dropdown__content a:focus {
    /* antd adds a text-decoration: underline to this rule, override it here */
    text-decoration: none;
  }
`;

export default DropdownStyles;
