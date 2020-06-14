import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import 'polyfills';

import selectors from 'state/selectors';

import AppRouter from 'routes/AppRouter';

// TODO: antd styles are conflicting with App styles. In particular, I notice
// some fonts and link styles are changed by including this. Need to fix, but
// not sure I'll have time to do this before the Copilot 1.3 release deadline.
import 'antd/dist/antd.css';
import './App.css';

export const App = props => {
  const { userId, userIsAdmin, userIsLoggedIn } = props;

  return (
    <AppRouter
      userId={userId}
      userIsAdmin={userIsAdmin}
      userIsLoggedIn={userIsLoggedIn}
    />
  );
};

App.propTypes = {
  userId: PropTypes.string,
  userIsLoggedIn: PropTypes.bool,
};

const mapStateToProps = (state, props) => ({
  userId: selectors.auth.user.uid(state, props),
  userIsLoggedIn: selectors.auth.user.isLoggedIn(state, props),
  userIsAdmin: selectors.auth.user.isAdmin(state, props),
});

export default connect(mapStateToProps)(App);
