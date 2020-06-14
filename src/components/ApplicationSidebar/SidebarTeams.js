import React, { useContext } from 'react';
import * as classroomsActions from 'state/classrooms/actions';
import * as routes from 'routes';
import fromParams from 'utils/fromParams';
import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import selectors from 'state/selectors';
import TermsContext from 'components/TermsContext';
import { query } from 'state/actions';

import SideBarTeamsProgram from './SidebarTeamsProgram';
import SideBarTeamsCaptain from './SidebarTeamsCaptain';
import SidebarDocuments from './SidebarDocuments';
import Icon from 'components/Icon';
import MenuSideMenu from 'components/MenuSideMenu';
import MenuItem from 'components/MenuItem';
import MenuLink from 'components/MenuLink';
import MenuItemIcon from 'components/MenuItemIcon';
import MenuItemText from 'components/MenuItemText';
import Show from 'components/Show';

const SideBarTeams = props => {
  const { anyRostersEmpty, isCaptain, isSupervisor, program } = props;
  const { teamId } = fromParams(props);
  const terms = useContext(TermsContext);

  // Don't display the side menu if this is a new team, since the links
  // don't make any sense in that case.
  if (teamId === 'Team_new') {
    return null;
  }

  return (
    <MenuSideMenu>
      <MenuItem>
        <MenuLink to={routes.toTeamDetails(teamId)} activeClassName="active">
          <MenuItemIcon>
            <Icon names="gear" />
          </MenuItemIcon>
          <MenuItemText>Settings</MenuItemText>
        </MenuLink>
      </MenuItem>

      <Show when={program && program.use_classrooms}>
        <MenuItem>
          <MenuLink
            to={routes.toTeamClassrooms(teamId)}
            activeClassName="active"
          >
            <MenuItemIcon>
              <Icon names="graduation-cap" />
            </MenuItemIcon>
            <MenuItemText>
              {terms.classrooms} {anyRostersEmpty && <Icon names="warning" />}
            </MenuItemText>
          </MenuLink>
        </MenuItem>
      </Show>

      <MenuItem>
        <MenuLink to={routes.toTeamReports(teamId)} activeClassName="active">
          <MenuItemIcon>
            <Icon names="line-chart" />
          </MenuItemIcon>
          <MenuItemText>Reports</MenuItemText>
        </MenuLink>
      </MenuItem>

      <SidebarDocuments program={program} teamId={teamId} />

      <MenuItem>
        <MenuLink to={routes.toTeam(teamId)} activeClassName="active">
          <MenuItemIcon>
            <Icon names="list-ol" />
          </MenuItemIcon>
          <MenuItemText>Stages</MenuItemText>
        </MenuLink>
      </MenuItem>

      <Route path={routes.toProgramSteps()} component={SideBarTeamsProgram} />

      <SideBarTeamsCaptain isCaptain={isCaptain} isSupervisor={isSupervisor} />
    </MenuSideMenu>
  );
};

const mapStateToProps = (state, props) => ({
  anyRostersEmpty: selectors.team.anyRostersEmpty(state, props),
  isCaptain: selectors.auth.user.team.isCaptain(state, props),
  isSupervisor: selectors.auth.user.team.isSupervisor(state, props),
  program: selectors.program(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...classroomsActions, query }, dispatch),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { teamId } = fromParams(this.props);

      if (teamId !== 'Team_new') {
        // classrooms needed to indicate if there are empty rosters
        this.props.actions.queryClassroomsByTeam(teamId);
        this.props.actions.query('programs');
      }
    },
  }),
)(SideBarTeams);
