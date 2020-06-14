import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import * as routes from 'routes';
import SidebarHome from './SidebarHome';
import SidebarOrganizations from './SidebarOrganizations';
import SidebarTeams from './SidebarTeams';
import theme from 'components/theme';

export const ApplicationSidebarStyles = styled.div`
  display: block;
  width: ${theme.units.sidebarWidth};

  position: fixed;
  top: ${theme.units.appBarHeight};
  bottom: 0;
  overflow-y: auto;

  background: ${theme.palette.secondary};
  font-size: 14px;
`;

const ApplicationSidebar = () => (
  <ApplicationSidebarStyles>
    <Switch>
      <Route path={routes.toHome()} component={SidebarHome} />
      <Route path={routes.toHomeNoProgram()} component={SidebarHome} />
      <Route path="/teams/:teamId" component={SidebarTeams} />
      <Route
        path="/organizations/:organizationId"
        component={SidebarOrganizations}
      />
    </Switch>
  </ApplicationSidebarStyles>
);

export default ApplicationSidebar;
