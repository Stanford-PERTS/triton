import React from 'react';

import AuthWrapper from 'components/AuthWrapper';

import './styles.css';

class Login extends React.Component {
  render() {
    return (
      <AuthWrapper>
        <div className="Login">
          <div className="center">
            <div className="UserWelcomeTitle">Down For Maintenance</div>
          </div>
          <p>We&rsquo;ll be back soon.</p>
        </div>
      </AuthWrapper>
    );
  }
}

export default Login;
