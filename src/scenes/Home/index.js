import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as organizationsActions from 'state/organizations/actions';
import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import * as uiActions from 'state/ui/actions';
import * as usersActions from 'state/users/actions';
import fromParams from 'utils/fromParams';
import fromSearch from 'utils/fromSearch';
import selectors from 'state/selectors';
import { signupLink } from 'config';
import { userProgramRedirect } from 'state/programs/actions';
import { withTermsContext } from 'components/TermsContext';

import AdminContent from 'components/AdminContent';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import OrganizationsList from 'scenes/OrganizationsList';
import TeamsList from 'scenes/TeamsList';
import UserWelcomeModal from 'scenes/UserWelcomeModal';
import UserRecentProgramUpdater from './UserRecentProgramUpdater';

const ProgramNotFound = () => (
  <InfoBox>
    We can&rsquo;t find this program. Please view available programs at&nbsp;
    <Link to={signupLink} data-test="no-program-link">
      perts.net/programs
    </Link>
    .
  </InfoBox>
);

const NoProgramWarning = () => (
  <InfoBox>
    You haven&rsquo;t signed up for a program yet. Please register at&nbsp;
    <Link to={signupLink} data-test="no-program-link">
      perts.net/programs
    </Link>
    .
  </InfoBox>
);

class Home extends React.Component {
  componentDidMount() {
    const { program: searchProgramLabel } = fromSearch(this.props);
    const { programLabel: routeProgramLabel } = fromParams(this.props);
    const { userProgramRedirect: redirect } = this.props.actions;

    if (routeProgramLabel) {
      // Just load data for display.
      this.getTeamsWithOptions(this.props);
      this.getOrganizationsWithOptions(this.props);
      // user.recent_program_id will be updated in componentDidUpdate()
    } else {
      // Start a complex HOA to figure out where we should go from here. As it
      // is, this scene should not render, except to show a warning for edge
      // cases.
      redirect(searchProgramLabel);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.refetchTeams(nextProps);
    this.refetchOrganizations(nextProps);
  }

  refetchTeams(nextProps) {
    // If the query string changes, re-fetch the teams based on changes.
    const { programLabel: oldLabel } = fromParams(this.props);
    const { programLabel: newLabel } = fromParams(nextProps);
    const { teamsQuery: oldTeamQ } = fromSearch(this.props);
    const { teamsQuery: newTeamQ } = fromSearch(nextProps);
    if (oldTeamQ !== newTeamQ || oldLabel !== newLabel) {
      this.getTeamsWithOptions(nextProps);
    }
  }

  refetchOrganizations(nextProps) {
    const { programLabel: oldLabel } = fromParams(this.props);
    const { programLabel: newLabel } = fromParams(nextProps);
    const { organizationsQuery: oldOrgQ } = fromSearch(this.props);
    const { organizationsQuery: newOrgQ } = fromSearch(nextProps);
    if (oldOrgQ !== newOrgQ || oldLabel !== newLabel) {
      this.getOrganizationsWithOptions(nextProps);
    }
  }

  getTeamsWithOptions(props) {
    const { actions, userIsAdmin } = props;
    const { programLabel } = fromParams(props);
    const { teamsQuery: teamsQueryJson = '{}' } = fromSearch(props);

    const teamOptions = JSON.parse(teamsQueryJson);
    if (programLabel && userIsAdmin) {
      teamOptions.program = programLabel;
    }
    // Non-admin users should NOT have their results filtered by program so
    // that SidebarHome can figure out what set of programs are available to
    // this user. Admins have all programs available on SidebarHome, so this
    // doesn't matter.

    actions.queryTeamsByUser(teamOptions);
  }

  getOrganizationsWithOptions(props) {
    const { actions, userIsAdmin } = props;
    const { programLabel } = fromParams(props);
    const { organizationsQuery: orgsQueryJson = '{}' } = fromSearch(props);

    const orgOptions = JSON.parse(orgsQueryJson);
    if (programLabel && userIsAdmin) {
      orgOptions.program = programLabel;
    }
    // See comment in getTeamsWithOptions().

    actions.queryOrganizations(orgOptions);
  }

  render() {
    /* eslint complexity: off */
    const {
      isLoadingHome,
      isLoadingOrganizations,
      isLoadingPrograms,
      isLoadingTeams,
      isLoadingUsers,
      location,
      organizationsLinks,
      pagedOrganizations,
      pagedTeams,
      program,
      programOrganizations,
      programTeams,
      teamsLinks,
      terms, // from context
      user,
      userIsAdmin,
    } = this.props;
    const { programLabel } = fromParams(this.props);

    const teams = userIsAdmin ? pagedTeams : programTeams;
    const orgs = userIsAdmin ? pagedOrganizations : programOrganizations;

    if (isLoadingHome) {
      return null;
    }

    if (programLabel) {
      return program ? (
        <>
          <UserWelcomeModal />
          {user && <UserRecentProgramUpdater program={program} user={user} />}
          <TeamsList
            isLoading={isLoadingTeams || isLoadingUsers || isLoadingPrograms}
            isEmpty={isEmpty(teams)}
            location={location}
            newTeamRoute={routes.toNewTeam(programLabel)}
            program={program}
            teams={teams}
            teamsLinks={teamsLinks}
            title={`Your ${terms.teams}`}
            user={user}
          />
          <OrganizationsList
            isLoading={
              isLoadingOrganizations || isLoadingUsers || isLoadingPrograms
            }
            isLoadingTeams={isLoadingTeams}
            isEmpty={isEmpty(orgs)}
            newOrganizationRoute={routes.toNewOrganization(programLabel)}
            organizations={orgs}
            organizationsLinks={organizationsLinks}
          />
          {userIsAdmin && <AdminContent />}
        </>
      ) : (
        <ProgramNotFound />
      );
    }
    // @todo: this should be masked by a HOA loading selector.
    return <NoProgramWarning />;
  }
}

function mapStateToProps(state, props) {
  return {
    isLoadingTeams: selectors.loading.teams(state, props),
    isLoadingOrganizations: selectors.loading.organizations(state, props),
    isLoadingPrograms: selectors.loading.programs(state, props),
    isLoadingUsers: selectors.loading.users(state, props),
    isLoadingHome: selectors.loading.hoa(userProgramRedirect())(state, props),
    user: selectors.auth.user(state, props),
    userIsAdmin: selectors.auth.user.isAdmin(state, props),
    userRecentProgram: selectors.auth.user.recentProgram(state, props),
    pagedTeams: selectors.auth.user.fetchedTeams.list(state, props),
    programTeams: selectors.auth.user.program.teams.list(state, props),
    teamsLinks: selectors.links.teams(state, props),
    pagedOrganizations: selectors.auth.user.fetchedOrganizations.list(
      state,
      props,
    ),
    programOrganizations: selectors.auth.user.program.organizations.list(
      state,
      props,
    ),
    organizationsLinks: selectors.links.organizations(state, props),
    program: selectors.program(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...organizationsActions,
        ...teamsActions,
        ...uiActions,
        ...usersActions,
        userProgramRedirect,
      },
      dispatch,
    ),
  };
}

export default compose(
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Home);
