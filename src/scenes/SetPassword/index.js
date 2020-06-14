import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as authActions from 'state/auth/actions';
import * as route from 'routes';
import AuthWrapper from 'components/AuthWrapper';
import fromSearch from 'utils/fromSearch';
import Link from 'components/Link';
import selectors from 'state/selectors';
import SetPasswordForm from './SetPasswordForm';
import { getJwtPayload } from 'services/triton/config';

import './styles.css';

const Footer = ({ setPasswordMode }) => (
  <Link to={route.toResetPassword()}>
    {setPasswordMode === 'reset' ? (
      <div>Request another password.</div>
    ) : (
      <div>Request another invitation.</div>
    )}
  </Link>
);

export class SetPasswordComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      email: '',
    };
  }
  componentDidMount() {
    this.props.actions.checkToken(this.props.match.params.token);

    // Get email being set/reset so we can display this on the form
    const email = this.getEmailBeingSet();
    this.setState({ email });
  }

  componentWillUnmount() {
    this.props.actions.passwordSetReset();
  }

  getEmailBeingSet = () => {
    const payload = getJwtPayload(this.props.match.params.token);
    return payload.email;
  };

  setPassword = () => {
    const { match, setPasswordFormValues } = this.props;
    const { setPassword } = this.props.actions;
    const { continue_url } = fromSearch(this.props);
    setPassword(
      match.params.token,
      setPasswordFormValues.password,
      continue_url,
    );
  };

  render() {
    const { disableForm } = this.props;
    const { email } = this.state;
    const { case: setPasswordMode } = fromSearch(this.props);

    return (
      <AuthWrapper footer={<Footer setPasswordMode={setPasswordMode} />}>
        <div className="SetPassword">
          <div className="center">
            {setPasswordMode === 'reset' ? (
              <h1>Reset your password</h1>
            ) : (
              <h1>Choose your password</h1>
            )}
          </div>
          <SetPasswordForm
            email={email}
            onSubmit={this.setPassword}
            disabled={disableForm}
          />
        </div>
      </AuthWrapper>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    setPasswordFormValues: selectors.form.values(state, {
      form: 'setPassword',
    }),
    // We want to disable the set/reset password form when either it's loading
    // (waiting on server response) or we have successfully set/reset the
    // password. There will be a slight lag after the password is set until the
    // app redirects the user to their logged in/home and we want to keep the
    // form disabled during that time.
    disableForm:
      selectors.loading.authUser(state, props) ||
      selectors.auth.setPasswordSuccess(state, props),
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
)(SetPasswordComponent);
