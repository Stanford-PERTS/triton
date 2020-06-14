import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import * as routes from 'routes';
import theme from 'components/theme';

import ApplicationBarLogo from 'components/ApplicationBarLogo';
import ApplicationBarTitle from 'components/ApplicationBarTitle';
import ApplicationBarMenu from 'components/ApplicationBarMenu';

const AppBar = styled.div`
  display: flex;
  align-items: center;

  position: fixed;

  width: 100%;
  height: ${theme.units.appBarHeight};
  padding: 0 20px;

  background: ${theme.palette.primary};
  color: ${theme.palette.white};
  box-shadow: ${theme.boxShadow};

  font-size: 20px;

  /* ApplicationBar should appear above app content. */
  z-index: ${theme.zIndex.applicationBar};
`;

const AppBarGrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  text-transform: uppercase;

  flex-grow: 1;
`;

// Since AppBar has `position: fixed` it is removed from the normal document
// flow. This component just exists to be a `block` component that has a height
// so other elements position themselves lower in the document equal to the
// height of the AppBar.
const AppBarOffset = styled.div`
  display: block;
  height: ${theme.units.appBarHeight};
`;

const ApplicationBarContent = () => (
  <>
    <AppBar>
      <ApplicationBarLogo />
      <AppBarGrow>
        <ApplicationBarTitle />
      </AppBarGrow>
      <ApplicationBarMenu />
    </AppBar>
    <AppBarOffset />
  </>
);

const RenderNothing = () => null;

const ApplicationBar = () => (
  <Switch>
    {/* Don't display on logged out routes */}
    <Route exact path="/" component={RenderNothing} />
    <Route path={routes.toLogin()} component={RenderNothing} />
    {/* <Route path={routes.toSignup()} component={RenderNothing} /> */}
    <Route path={routes.toSetPassword()} component={RenderNothing} />
    <Route path={routes.toResetPassword()} component={RenderNothing} />

    {/*
      Do display on all these routes. We don't use a more generic catch-all
      because it would prevent ApplicationBar from having various route params.
    */}
    <Route path="/teams/:teamId" component={ApplicationBarContent} />
    <Route path={routes.toNewTeam()} component={ApplicationBarContent} />
    <Route
      path="/organizations/:organizationId"
      component={ApplicationBarContent}
    />
    <Route
      path={routes.toNewOrganization()}
      component={ApplicationBarContent}
    />
    <Route path={routes.toUsers()} component={ApplicationBarContent} />
    <Route path={routes.toHome()} component={ApplicationBarContent} />
    <Route path={routes.toHomeNoProgram()} component={ApplicationBarContent} />
    <Route path={routes.toHomeNoProgram()} component={ApplicationBarContent} />
    <Route path={routes.toReportsUpload()} component={ApplicationBarContent} />
  </Switch>
);

export default ApplicationBar;
