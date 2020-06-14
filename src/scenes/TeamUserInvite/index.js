import React from 'react';
import { compose, defaultProps, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import withLoading from 'utils/withLoading';
import validate from 'scenes/UserDetails/validate';
import isEmail from 'validator/lib/isEmail';

import fromParams from 'utils/fromParams';
import formAction from 'state/form/teamUserInvite/actions';
import * as teamsActions from 'state/teams/actions';
import * as usersActions from 'state/users/actions';
import selectors from 'state/selectors';

import TeamUserInviteLoading from './TeamUserInviteLoading';
import TeamUserInviteRender from './TeamUserInviteRender';
import TeamUserInviteWrapper from './TeamUserInviteWrapper';

const form = 'userInvite';

const mapStateToProps = (state, props) => ({
  stepType: fromParams(props).stepType,
  parentLabel: fromParams(props).parentLabel,
  formValues: selectors.form.values(state, { form }),
  team: selectors.team(state, props),
  isLoading: selectors.loading.teams(state, props),
  userExists: selectors.form.values(state, { form }).existingUser,
  usersOnTeam: selectors.team.users.list(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...teamsActions, ...usersActions }, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { team, usersOnTeam } = this.props;
      const { teamId } = fromParams(this.props);
      const { getTeam, queryUsersByTeam } = this.props.actions;

      // We won't have loaded team if we navigated here directly.
      if (!team) {
        getTeam(teamId);
      }

      // We won't have loaded team users if we navigated here directly. There
      // isn't a way to know for sure if we've already attempted to load users,
      // so let's use the fact that there are 0 users as our best indicator.
      if (usersOnTeam.length === 0) {
        queryUsersByTeam(teamId);
      }
    },
  }),
  // Make handlers & props available to child components
  Component => props => {
    const handlers = {
      checkUserExists(event) {
        const { checkUserExists } = props.actions;
        const email = event.target.value;

        if (isEmail(email)) {
          checkUserExists(email);
        }
      },
    };

    const userExistsAsMember = Boolean(
      props.usersOnTeam.find(u => u.uid === props.formValues.uid),
    );

    return (
      <Component
        {...props}
        {...handlers}
        userExistsAsMember={userExistsAsMember}
      />
    );
  },
  defaultProps({
    initialValues: {
      // Set the Receive Email Notifications toggle on initially.
      receive_email: true,
    },
  }),
  reduxFormOnSubmit(formAction, {
    propsToInclude: ['team', 'stepType', 'parentLabel'],
  }),
  reduxForm({
    form,
    validate,
    // Necessary for `pristine` prop to update properly after form submit.
    enableReinitialize: true,
  }),
  withLoading({
    WhenLoadingComponent: TeamUserInviteLoading,
    WrapperComponent: TeamUserInviteWrapper,
  }),
)(TeamUserInviteRender);
