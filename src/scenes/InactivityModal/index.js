import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getJwtPayload } from 'services/triton/config';

import * as authActions from 'state/auth/actions';
import * as userActions from 'state/users/actions';
import selectors from 'state/selectors';

import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import Modal from 'components/Modal';

// The number of seconds before the auth token expires that we'd like to begin
// displaying the session timeout modal.
export const SECONDS_UNTIL_TOKEN_EXPIRATION = 60;
// Give ourselves some "lag time" to forgive slower connections to the server.
export const LAG_TIME = 10;

class InactivityModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timeUntilExpiration: SECONDS_UNTIL_TOKEN_EXPIRATION,
      display: false,
    };

    this.interval = setInterval(() => {
      this.shouldDisplayModal(SECONDS_UNTIL_TOKEN_EXPIRATION);
      this.shouldLogOutUser();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tokenExpirationTime = () => {
    const payload = getJwtPayload();
    return payload.exp || 0;
  };

  shouldDisplayModal = timeRemainingToDisplay => {
    const expirationTime = this.tokenExpirationTime();
    const currentTime = Math.floor(Date.now() / 1000);

    // in seconds
    const timeUntilExpiration = expirationTime - currentTime - LAG_TIME;

    if (timeUntilExpiration <= timeRemainingToDisplay) {
      this.setState({
        timeUntilExpiration,
        display: true,
      });
    } else {
      this.setState({
        timeUntilExpiration,
        display: false,
      });
    }
  };

  shouldLogOutUser = () => {
    // If the expiration counter reaches 0, then force a logout of the user.
    // The user's auth token has expired anyway.
    if (this.state.timeUntilExpiration < 0) {
      this.logout();
    }
  };

  keepSessionActive = () => {
    // Fire off a request to any endpoint to renew our auth token.
    const { userId } = this.props;
    this.props.actions.getUser(userId);
  };

  logout = () => {
    this.props.actions.logoutUser();
  };

  render() {
    const { display } = this.state;
    return display ? (
      <Modal title="Session Timeout">
        <p>You are being timed-out due to inactivity.</p>
        <p>
          <i className="fa fa-hourglass-o fa-3x" />
        </p>

        <ButtonContainer>
          <Button onClick={this.keepSessionActive} className="block">
            Keep me logged in ({this.state.timeUntilExpiration})
          </Button>

          <Button onClick={this.logout} className="block cancel">
            Log me out
          </Button>
        </ButtonContainer>
      </Modal>
    ) : (
      <div />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    userId: selectors.auth.user.uid(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...authActions, ...userActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(InactivityModal);
