import React from 'react';
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';

import fromParams from 'utils/fromParams';
import * as sharedActions from 'state/shared/actions';
import * as teamsActions from 'state/teams/actions';
import * as usersActions from 'state/users/actions';
import selectors from 'state/selectors';

import Loading from 'components/Loading';
import TeamUsersRender from './TeamUsersRender';
import TeamUsersWrapper from './TeamUsersWrapper';

export const propTypes = {
  ...withLoadingPropTypes,
};

const mapStateToProps = (state, props) => ({
  isLoading:
    selectors.loading.teams(state, props) ||
    selectors.loading.users(state, props),
  team: selectors.team(state, props),
  program: selectors.program(state, props),
  users: selectors.team.users.list(state, props),
  userLoggedIn: selectors.auth.user(state, props),
  hasCaptainPermission: selectors.auth.user.hasCaptainPermission(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    { ...sharedActions, ...teamsActions, ...usersActions },
    dispatch,
  ),
});

export default compose(
  setDisplayName('TeamUsers'),
  setPropTypes(propTypes),
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { getTeam, queryUsersByTeam } = this.props.actions;
      const { teamId } = fromParams(this.props);

      getTeam(teamId);
      queryUsersByTeam(teamId);
    },
  }),
  // Make handlers available to child components
  Component => props => {
    const handlers = {
      handlePromoteUser(userId) {
        const { updateTeam } = props.actions;
        const { team } = props;

        const updatedTeam = {
          ...team,
          captain_id: userId,
        };

        updateTeam(updatedTeam);
      },
      handleRemoveUser(userId) {
        const { updateUser } = props.actions;
        const { team, users } = props;

        const user = users.find(u => u.uid === userId);

        const updatedUser = {
          ...user,
          owned_teams: user.owned_teams.filter(ot => ot !== team.uid),
        };

        updateUser(updatedUser);
      },
      handleResendInvitation(user) {
        const { inviteUsers } = props.actions;
        const { team, userLoggedIn } = props;

        inviteUsers([user], userLoggedIn, team);
      },
      handleLeaveTeam() {
        const { leaveTeam } = props.actions;
        const { team } = props;

        leaveTeam(team);
      },
    };

    return <Component {...props} {...handlers} />;
  },
  withLoading({
    WrapperComponent: TeamUsersWrapper,
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    // WhenEmptyComponent shouldn't be needed since there should always be at
    // least 1 user on the team: the team captain. Handling the prompt to invite
    // users in the TeamUsersRender component.
  }),
)(TeamUsersRender);
