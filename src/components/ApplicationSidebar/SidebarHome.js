import React from 'react';
import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { matchPath, withRouter, Route } from 'react-router-dom';

import * as routes from 'routes';
import fromSearch from 'utils/fromSearch';
import selectors from 'state/selectors';
import { query } from 'state/actions';
import { signupLink } from 'config';
import { userProgramRedirect } from 'state/programs/actions';

import ProgramSearchField from 'components/ProgramSearchField';
import SideBarTeamsProgram from './SidebarTeamsProgram';
import SideBarTeamsCaptain from './SidebarTeamsCaptain';
import MenuSideMenu from 'components/MenuSideMenu';
import MenuItem from 'components/MenuItem';
import MenuLink from 'components/MenuLink';
import MenuItemIcon from 'components/MenuItemIcon';
import MenuItemText from 'components/MenuItemText';
import Link from 'components/Link';
import Icon from 'components/Icon';

const ProgramMenu = ({ programsToList, showAddButton }) => (
  <>
    {programsToList.map(p => (
      <MenuItem key={p.uid}>
        <MenuLink to={routes.toHome(p.label)} activeClassName="active">
          <MenuItemIcon>
            <Icon names="cube" />
          </MenuItemIcon>
          <MenuItemText>{p.name}</MenuItemText>
        </MenuLink>
      </MenuItem>
    ))}
    {showAddButton && (
      <MenuItem className="add" button>
        <Link to={signupLink}>
          <MenuItemIcon>
            <Icon names="plus" fixedWidth />
          </MenuItemIcon>
          <MenuItemText>Join a program</MenuItemText>
        </Link>
      </MenuItem>
    )}
  </>
);

const SideBarHome = props => {
  const { isAdmin, isLoadingHome, program, programs } = props;
  const { q: searchQuery } = fromSearch(props);

  const teamMatch = matchPath(props.location.pathname, {
    path: routes.toNewTeam(),
    exact: true,
    strict: false,
  });
  const orgMatch = matchPath(props.location.pathname, {
    path: routes.toNewOrganization(),
    exact: true,
    strict: false,
  });

  // For the new team and new org forms, the user's full set of teams and orgs
  // may not be available. Just display the route's program, so it's clear what
  // program they're signing up for.
  const currentProgramOnly = program ? [program] : [];
  const programsToList = teamMatch || orgMatch ? currentProgramOnly : programs;
  const showAddButton = !teamMatch && !orgMatch;

  return (
    <MenuSideMenu>
      {!isLoadingHome && (
        <ProgramMenu
          showAddButton={showAddButton}
          programsToList={programsToList}
        />
      )}
      {isAdmin && <ProgramSearchField program={program} query={searchQuery} />}
      <Route path={routes.toProgramSteps()} component={SideBarTeamsProgram} />

      <SideBarTeamsCaptain />
    </MenuSideMenu>
  );
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
  programs: selectors.programs.list(state, props),
  isLoadingHome: selectors.loading.hoa(userProgramRedirect())(state, props),
  isAdmin: selectors.auth.user.isAdmin(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ query }, dispatch),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      this.props.actions.query('programs');
    },
  }),
)(SideBarHome);
