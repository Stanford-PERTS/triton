import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import selectors from 'state/selectors';

import DeleteButton from 'components/DeleteButton';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import { withTermsContext } from 'components/TermsContext';

class TeamUsersLeave extends React.Component {
  render() {
    const {
      handleLeaveTeam,
      leaving,
      terms, // from context
      userIsATeamContact,
      userIsCaptain,
      userIsOnTeam,
    } = this.props;

    return (
      userIsOnTeam && (
        <Section danger title={`Leave ${terms.team}`}>
          <SectionItem>
            <DeleteButton
              initialText={`Are you sure you want to leave the team?
          ${
            userIsATeamContact
              ? `Your ${terms.captain.toLowerCase()} will be assigned as the ` +
                `${terms.contact.toLowerCase()} for your classes.`
              : ''
          }
          `}
              confirmationText={
                "Once you leave a team, there's no way to undo."
              }
              disabled={userIsCaptain}
              disabledText={
                `If you want to leave the ${terms.team.toLowerCase()}, ` +
                `please assign someone else as ` +
                `${terms.captain.toLowerCase()} first.`
              }
              loading={leaving}
              loadingText={'Leaving Team'}
              onClick={handleLeaveTeam}
            >
              Leave {terms.team}
            </DeleteButton>
          </SectionItem>
        </Section>
      )
    );
  }
}

const mapStateToProps = (state, props) => ({
  userIsOnTeam: selectors.authUser.team.isMember(state, props),
  userIsCaptain: selectors.authUser.team.isCaptain(state, props),
  userIsATeamContact: selectors.authUser.team.isContact(state, props),
  hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
  // Treating the loading flag from sharedData as an indicator that user is
  // leaving the team, since the only 'shared' action we are calling is the
  // leaveTeam action.
  leaving:
    selectors.loading.shared(state, props) ||
    selectors.updating.users(state, props),
});

export default compose(
  withRouter,
  withTermsContext,
  connect(mapStateToProps),
)(TeamUsersLeave);
