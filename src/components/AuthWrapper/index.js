import React from 'react';
import styled from 'styled-components';

import Card from 'components/Card';
import pertsLogo from 'assets/perts_logo.png';
import pertsTitle from 'assets/perts_title.png';

const AuthWrapperPage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: auto;
  height: auto;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  display: block;
  width: 100px;
  margin: 15px auto;
`;

const Title = styled.img`
  display: block;
  height: 36px;
  margin: 15px auto;
`;

const AuthWrapperContainer = styled.div`
  width: 400px;

  p {
    margin: 0;
  }
`;

const AuthWrapperFooter = styled(Card.Content)`
  text-align: center;

  > :not(:first-child) {
    margin-top: 8px;
  }
`;

const AuthWrapper = props => {
  const { children, footer } = props;

  return (
    <AuthWrapperPage className="LaunchPage">
      <AuthWrapperContainer>
        <Card flat>
          <Card.Content>
            <div className="center">
              <Logo src={pertsLogo} alt="logo" />
              <Title src={pertsTitle} alt="PERTS Copilot" />
              {children}
            </div>
          </Card.Content>
          {footer && <AuthWrapperFooter>{footer}</AuthWrapperFooter>}
        </Card>
      </AuthWrapperContainer>
    </AuthWrapperPage>
  );
};

export default AuthWrapper;
