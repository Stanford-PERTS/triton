import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as usersActions from 'state/users/actions';
import selectors from 'state/selectors';

import Modal from 'components/Modal';

import UserWelcomeForm, { shouldDisplay } from './UserWelcomeForm';

const dismissed_key = userId =>
  `triton:${userId}:UserWelcomeTutorial:dismissed`;

class UserWelcomeModal extends React.Component {
  constructor(props) {
    super(props);

    const { neptuneUserUid: userId } = props;

    const dismissed = localStorage.getItem(dismissed_key(userId)) === 'true';
    this.state = { dismissed };
  }

  componentDidMount() {
    const { getUser, neptuneUserUid } = this.props;
    getUser(neptuneUserUid);
  }

  dismiss = () => {
    // This makes sure that
    // * the user's preference is remembered across page loads (local storage)
    // * changes in the dismissed value are recognized immediately by react
    //   (which doesn't monitor values in local storage)
    // Note local storage is also synchronized with component state in the
    // constructor.
    const { neptuneUserUid: userId } = this.props;
    localStorage.setItem(dismissed_key(userId), 'true');
    this.setState({ dismissed: true });
  };

  freezeBodyScroll(shouldFreeze = true) {
    window.document.body.style.overflow = shouldFreeze ? 'hidden' : null;
  }

  handleSubmit = values => {
    const { tritonUser, updateUser } = this.props;

    // Translate the opt-out checkbox to a positive consent value.
    if (values.noConsent === true) {
      values.consent = 0;
    } else if (values.noConsent === false) {
      values.consent = 1;
    }
    // Else the user hasn't clicked the button in the consent form, so do not
    // record a value. This applies when you submit the name form but haven't
    // seen the consent form yet.
    delete values.noConsent;

    updateUser({
      ...tritonUser,
      ...values,
    });
  };

  render() {
    const { neptuneUserUid, program, tritonUser } = this.props;
    const { dismissed } = this.state;

    const user = tritonUser && {
      ...tritonUser,
      uid: neptuneUserUid,
    };

    // Depending on the properties of the user, we may not need to dispay.
    // Note that the user may only dismiss this modal after they've been
    // prompted to enter a name and a consent value. If they go back and change
    // these values (like erasing their name), we still wouldn't prompt them
    // again.
    if (!user || !shouldDisplay(program, user) || dismissed) {
      this.freezeBodyScroll(false);
      return null;
    }
    this.freezeBodyScroll();

    return (
      <Modal className="UserWelcomeModal">
        <UserWelcomeForm
          onSubmit={this.handleSubmit}
          user={user}
          program={program}
          dismiss={this.dismiss}
        />
      </Modal>
    );
  }
}

UserWelcomeModal.propTypes = {
  neptuneUserUid: PropTypes.string,
  getUser: PropTypes.func,
  user: PropTypes.object,
};

UserWelcomeModal.defaultProps = {
  getUser: () => null,
};

const mapStateToProps = (state, props) => ({
  neptuneUserUid: selectors.auth.user.uid(state, props),
  program: selectors.program(state, props),
  tritonUser: selectors.auth.user(state, props),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(usersActions, dispatch);

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(UserWelcomeModal);
