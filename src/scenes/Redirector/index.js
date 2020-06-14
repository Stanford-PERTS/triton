import React from 'react';
import { compose, lifecycle } from 'recompose';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { redirectClear } from 'state/ui/actions';
import selectors from 'state/selectors';

const Redirector = ({ redirect: { path, push } }) => {
  // Don't redirect if we're at /login. Why? On a 401 response from an API call,
  // `state/api`'s callWithApiAuthentication puts a LOGOUT_REQUEST. Each of
  // these will redirect to /login. In many cases, we've queued up a few API at
  // the same time. If multiple come back 401, then we'll trigger multiple
  // LOGOUT_REQUEST actions. The first one will properly set the continue_url,
  // allowing the user to get back to their previous view after logging back in,
  // but subsequent logouts will wipe that out.
  if (window.location.pathname !== '/login' && path) {
    return <Redirect to={path} push={push} />;
  }

  return null;
};

const mapStateToProps = (state, props) => ({
  redirect: selectors.redirect(state, props),
});

const mapDispatchToProps = dispatch => ({
  clearRedirect: bindActionCreators(redirectClear, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidUpdate() {
      const {
        redirect: { path },
        clearRedirect,
      } = this.props;
      if (path) {
        clearRedirect();
      }
    },
  }),
)(Redirector);
