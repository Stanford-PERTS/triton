import React from 'react';
import styled from 'styled-components';
import Redirector from 'scenes/Redirector';

import ApplicationBar from 'components/ApplicationBar';
import ApplicationSidebar, {
  ApplicationSidebarStyles,
} from 'components/ApplicationSidebar';
import theme from 'components/theme';

const ContentRow = styled.div`
  display: block;
`;

const ContentColSidebar = styled.div`
  @media ${theme.units.mobileMaxWidth} {
    ${ApplicationSidebarStyles} {
      display: none;
    }
  }
`;

const ContentColMain = styled.main`
  display: block;
  margin-left: ${theme.units.sidebarWidth};

  @media ${theme.units.mobileMaxWidth} {
    margin-left: 0;
  }

  padding: 38px;

  max-width: 750px;
  /*
    There isn't enough room for buttons, titles, etc., if we allow the width to
    go any more narrow than this.
  */
  min-width: 460px;

  /*
    TODO Remove the following styles. These are quick-fix temp styles to get
    main content children to display "better" while we roll out the remainder
    of the Copilot 2018 redesign. https://github.com/PERTS/triton/issues/924
  */
  & > div,
  & > form {
    width: 100%;

    .SectionItemLinkIcon {
      width: 20px;
    }
  }
`;

export default ({ children }) => (
  <>
    <Redirector />
    <ApplicationBar />
    <ContentRow>
      <ContentColSidebar>
        <ApplicationSidebar />
      </ContentColSidebar>
      {/*
        Note: We are moving away from using className, but this instance should
        be left so that scenes/OrganizationDashboard can override the max-width.
      */}
      <ContentColMain className="MainContent">{children}</ContentColMain>
    </ContentRow>
  </>
);
