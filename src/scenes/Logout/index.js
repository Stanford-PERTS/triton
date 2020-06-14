import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as authActions from 'state/auth/actions';

class Logout extends React.Component {
  componentDidMount() {
    this.props.actions.logoutUser();
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(authActions, dispatch),
});

export default connect(
  null,
  mapDispatchToProps,
)(Logout);
