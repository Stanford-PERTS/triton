import React from 'react';
import { compose, branch, renderNothing } from 'recompose';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import Dropdown, {
  DropdownTrigger,
  DropdownContent,
} from 'react-simple-dropdown';

import * as routes from 'routes';

import DropdownItem from 'components/DropdownItem';
import DropdownMenu from 'components/DropdownMenu';
import DrowndownStyles from 'components/DropdownStyles';
import Icon from 'components/Icon';
import IconButton from 'components/IconButton';
import Link from 'components/Link';

const ApplicationBarMenuSpacing = styled.div`
  margin-left: 8px;

  a:focus {
    text-decoration: none;
  }
`;

const MenuIconStyled = styled(Icon)`
  margin-right: 12px;
`;

class ApplicationBarMenu extends React.Component {
  hideDropdown = () => {
    this.refs.dropdown.hide();
  };

  render() {
    const { program, userId } = this.props;
    const to = program
      ? routes.toHome(program.label)
      : routes.toHomeNoProgram();

    return (
      <>
        <ApplicationBarMenuSpacing>
          <Link to={to} Component={IconButton} aria-label="Home">
            <Icon names="home" />
          </Link>
        </ApplicationBarMenuSpacing>

        <DrowndownStyles>
          <Dropdown ref="dropdown">
            <DropdownTrigger>
              <ApplicationBarMenuSpacing>
                <IconButton aria-label="Application Menu">
                  <Icon names="bars" />
                </IconButton>
              </ApplicationBarMenuSpacing>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownMenu>
                <DropdownItem>
                  <Link
                    to={routes.toNotifications(userId)}
                    onClick={this.hideDropdown}
                  >
                    <MenuIconStyled names="bell" />
                    Notifications
                  </Link>
                </DropdownItem>
                <DropdownItem>
                  <Link
                    to={routes.toUserDetails(userId)}
                    onClick={this.hideDropdown}
                  >
                    <MenuIconStyled names="user" />
                    User Account
                  </Link>
                </DropdownItem>
                <DropdownItem>
                  <Link to={routes.toLogout()} onClick={this.hideDropdown}>
                    <MenuIconStyled names="sign-out" />
                    Log Out
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </DropdownContent>
          </Dropdown>
        </DrowndownStyles>
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
  userId: selectors.auth.user.uid(state, props),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
  branch(({ userId }) => !userId, renderNothing),
)(ApplicationBarMenu);
