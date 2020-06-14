import React from 'react';
import htmlParser from 'html-react-parser';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authActions from 'state/auth/actions';
import fromSearch from 'utils/fromSearch';
import selectors from 'state/selectors';

import AuthWrapper from 'components/AuthWrapper';
import { Footer } from 'scenes/Login';
import LoginForm from './LoginForm';

import './styles.css';

export const SET_PASSWORD_SUCCESS_MESSAGE =
  'Your password was successfully saved.<br />You may now sign in below.';

class Login extends React.Component {
  login = () => {
    const { actions, loginFormValues } = this.props;
    const { continue_url } = fromSearch(this.props);

    actions.loginUser(
      loginFormValues.email,
      loginFormValues.password,
      continue_url,
    );
  };

  render() {
    const { setPassword } = fromSearch(this.props);

    return (
      <>
        <AuthWrapper footer={<Footer />}>
          <div className="Login">
            {setPassword && (
              <div className="SetPasswordSuccess">
                {htmlParser(SET_PASSWORD_SUCCESS_MESSAGE)}
              </div>
            )}
            <LoginForm onSubmit={this.login} />

            <p>
              By signing in or creating an account, you agree to our{' '}
              <a href="https://www.perts.net/terms-of-use">Terms of Use</a> and{' '}
              <a href="https://www.perts.net/privacy">Privacy Policy</a>.
            </p>
          </div>
        </AuthWrapper>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loginFormValues: selectors.form.values(state, { form: 'login' }),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...authActions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
