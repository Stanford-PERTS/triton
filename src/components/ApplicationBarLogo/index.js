import React from 'react';
import styled from 'styled-components';
import Media from 'react-media';
import Dropdown, {
  DropdownTrigger,
  DropdownContent,
} from 'react-simple-dropdown';
import ApplicationSidebar from 'components/ApplicationSidebar';
import Logo from 'components/Logo';
import LogoBox from 'components/LogoBox';
import theme from 'components/theme';

const DropdownStyles = styled.div`
  .dropdown {
    position: relative;
  }

  .dropdown .dropdown__content {
    position: absolute;
    left: -20px;
  }
`;

// To darken/cover main content while dropdown menu is open so that focus is
// placed on the menu.
const DropdownMask = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
`;

class ApplicationBarLogo extends React.Component {
  hideDropdown = () => {
    this.refs.dropdown.hide();
  };

  render() {
    return (
      <>
        <Media query={theme.units.desktopMinWidth}>
          <Logo />
        </Media>
        <Media query={theme.units.mobileMaxWidth}>
          <DropdownStyles>
            <Dropdown ref="dropdown">
              <DropdownTrigger>
                <LogoBox />
              </DropdownTrigger>
              <DropdownContent onClick={this.hideDropdown}>
                <DropdownMask>
                  <ApplicationSidebar />
                </DropdownMask>
              </DropdownContent>
            </Dropdown>
          </DropdownStyles>
        </Media>
      </>
    );
  }
}

export default ApplicationBarLogo;
