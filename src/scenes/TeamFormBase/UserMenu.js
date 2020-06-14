import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import Dropdown from 'components/Dropdown';
import Modal from 'components/Modal';
import { withTermsContext } from 'components/TermsContext';

import fromParams from 'utils/fromParams';
import * as routes from 'routes';

export class UserMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      promotingUser: null,
      removingUser: null,
      invitingUser: null,
    };
  }

  // Handlers for promoting user

  handleRequestPromote = promotingUser =>
    this.setState({ ...this.state, promotingUser });

  handleClearPromote = () =>
    this.setState({ ...this.state, promotingUser: null });

  handleConfirmPromote = () => {
    const { handlePromoteUser } = this.props;
    const { promotingUser } = this.state;

    handlePromoteUser(promotingUser.uid);
    this.handleClearPromote();
  };

  // Handlers for removing user

  handleRequestRemove = removingUser =>
    this.setState({ ...this.state, removingUser });

  handleClearRemove = () =>
    this.setState({ ...this.state, removingUser: null });

  handleConfirmRemove = () => {
    const { handleRemoveUser } = this.props;
    const { removingUser } = this.state;

    handleRemoveUser(removingUser.uid);
    this.handleClearRemove();
  };

  // Handlers for inviting user

  handleRequestInvite = invitingUser =>
    this.setState({ ...this.state, invitingUser });

  handleClearInvite = () =>
    this.setState({ ...this.state, invitingUser: null });

  handleConfirmInvite = () => {
    const { handleResendInvitation } = this.props;
    const { invitingUser } = this.state;

    handleResendInvitation(invitingUser);
    this.handleClearInvite();
  };

  render() {
    const {
      hasCaptainPermission,
      terms, // from context
      user,
      userIsCaptain,
      userIsVerified,

      disabled,
      history,
      style,
    } = this.props;
    const { promotingUser, removingUser, invitingUser } = this.state;
    const { teamId, stepType, parentLabel } = fromParams(this.props);

    const viewUserDetails = () =>
      parentLabel
        ? history.push(
            routes.toProgramTeamUserDetails(
              teamId,
              stepType,
              parentLabel,
              user.uid,
            ),
          )
        : history.push(routes.toTeamUserDetails(teamId, user.uid));

    const canPromote = hasCaptainPermission && userIsVerified && !userIsCaptain;
    const canRemove = hasCaptainPermission && !userIsCaptain;

    return (
      <>
        <Dropdown
          className="UserMenu"
          style={style}
          text="Options"
          disabled={disabled}
        >
          <Dropdown.Menu>
            <Dropdown.Header>{user.name}</Dropdown.Header>
            <Dropdown.Item
              className="view-user-details"
              text="View User Details"
              icon="book"
              onClick={viewUserDetails}
            />
            <Dropdown.Item
              className="promote-to-captain"
              disabled={!canPromote}
              text={`Promote to ${terms.captain}`}
              icon="graduation-cap"
              onClick={() => this.handleRequestPromote(user)}
            />
            <Dropdown.Item
              className="remove-from-team"
              disabled={!canRemove}
              text={`Remove from ${terms.team}`}
              icon="remove"
              onClick={() => this.handleRequestRemove(user)}
            />
            <Dropdown.Item
              className="resend-invitation"
              disabled={userIsVerified}
              text="Resend Invitation"
              icon="envelope"
              onClick={() => this.handleRequestInvite(user)}
            />
          </Dropdown.Menu>
        </Dropdown>

        {promotingUser && (
          <Modal title="Are You Sure?">
            <p>
              Are you sure you want to promote{' '}
              <em>{promotingUser.name || promotingUser.email}</em> to{' '}
              {terms.captain.toLowerCase()}?
            </p>
            <ButtonContainer horizontal>
              <Button cancel onClick={this.handleClearPromote}>
                Cancel
              </Button>
              <Button caution onClick={this.handleConfirmPromote}>
                Yes
              </Button>
            </ButtonContainer>
          </Modal>
        )}

        {removingUser && (
          <Modal title="Are You Sure?">
            <p>
              Are you sure you want to remove{' '}
              <em>{removingUser.name || removingUser.email}</em> from the team?
            </p>
            <ButtonContainer horizontal>
              <Button cancel onClick={this.handleClearRemove}>
                Cancel
              </Button>
              <Button caution onClick={this.handleConfirmRemove}>
                Yes
              </Button>
            </ButtonContainer>
          </Modal>
        )}

        {invitingUser && (
          <Modal title="Are You Sure?">
            <p>
              Are you sure you want to resend an invitation to{' '}
              <em>{invitingUser.name || invitingUser.email}</em>?
            </p>
            <ButtonContainer horizontal>
              <Button cancel onClick={this.handleClearInvite}>
                Cancel
              </Button>
              <Button caution onClick={this.handleConfirmInvite}>
                Yes
              </Button>
            </ButtonContainer>
          </Modal>
        )}
      </>
    );
  }
}

UserMenu.propTypes = {
  hasCaptainPermission: PropTypes.bool,
  user: PropTypes.object.isRequired,
  userIsCaptain: PropTypes.bool,
  userIsVerified: PropTypes.bool,

  disabled: PropTypes.bool,
  history: PropTypes.object,

  handlePromoteUser: PropTypes.func.isRequired,
  handleRemoveUser: PropTypes.func.isRequired,
  handleResendInvitation: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  withTermsContext,
)(UserMenu);
