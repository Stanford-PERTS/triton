import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AuthWrapper from 'components/AuthWrapper';
import ResetPasswordForm from './ResetPasswordForm';
import Link from 'components/Link';
import * as authActions from 'state/auth/actions';
import selectors from 'state/selectors';

import * as route from 'routes';

import './styles.css';

class ResetPassword extends React.Component {
  componentWillUnmount() {
    this.props.actions.passwordResetReset();
  }

  resetPassword = () => {
    const { actions, resetFormValues } = this.props;
    actions.resetPassword(resetFormValues.email);
  };

  render() {
    const { resetPasswordSuccess } = this.props;

    return resetPasswordSuccess ? (
      <AuthWrapper>
        <div className="ResetPassword">
          <div className="center">
            <h1>Check your email</h1>
          </div>
          <div className="ResetPasswordSuccess">
            <p>
              We have sent an email to {resetPasswordSuccess} that you can use
              to reset your password.
            </p>
            <p>
              Please click the link in the email to complete the password reset
              process.
            </p>
          </div>
        </div>
      </AuthWrapper>
    ) : (
      <AuthWrapper
        footer={
          <Link to={route.toLogin()}>Remember your password? Sign in</Link>
        }
      >
        <div className="ResetPassword">
          <div className="center">
            <h1>Reset your password</h1>
          </div>

          <ResetPasswordForm onSubmit={this.resetPassword} />
        </div>
      </AuthWrapper>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    resetPasswordSuccess: selectors.auth.resetPasswordSuccess(state, props),
    resetFormValues: selectors.form.values(state, { form: 'reset' }),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(authActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResetPassword);
