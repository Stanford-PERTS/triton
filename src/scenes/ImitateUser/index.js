import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as authActions from 'state/auth/actions';

import DeleteButton from 'components/DeleteButton';

class ImitateUser extends React.Component {
  state = {
    email: '',
  };

  updateEmail = event => {
    this.setState({ email: event.target.value });
  };

  imitateUser = () => {
    this.props.actions.imitateUser(this.state.email);
  };

  render() {
    return (
      <div>
        <div className="ImitateUserLabel">Imitate User</div>
        <div className="ImitateUserForm">
          <input
            type="text"
            placeholder="Enter user's email address"
            value={this.state.email}
            onChange={this.updateEmail}
          />
        </div>
        <div className="ImitateUserButton">
          <DeleteButton
            confirmationText={''}
            initialText={''}
            onClick={this.imitateUser}
          >
            Imitate User
          </DeleteButton>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImitateUser);
