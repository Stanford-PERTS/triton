import React from 'react';
import { compose } from 'recompose';
import styled from 'styled-components';
import { withRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import selectors from 'state/selectors';
import fromSearch from 'utils/fromSearch';

const TitleTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const TitleTextProgram = styled.div`
  font-size: 11px;
  text-transform: capitalize;
`;

// Component that will end up being rendered with the title text.
const TitleTextRender = ({ children, program }) => (
  <TitleTextWrapper>
    <div>{children}</div>
    {program && <TitleTextProgram>{program}</TitleTextProgram>}
  </TitleTextWrapper>
);

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
  user: selectors.user(state, props),
  team: selectors.team(state, props),
  classroom: selectors.classroom(state, props),
  organization: selectors.organization(state, props),
});

// Wrapper component so that we can provide route params to `connect`
// via `withRouter`. We need to do this since the `Title` component will not
// have access to full route params from `withRouter` since the component is
// mounted when matched against `/`.
const TitleText = compose(
  withRouter,
  connect(mapStateToProps),
  BaseComponent => ({ entity, program, ...props }) => (
    <BaseComponent program={program && program.name}>
      {props[entity] && props[entity].name}
    </BaseComponent>
  ),
)(TitleTextRender);

// Route switching is handled here. We can take advantage of the fact that Route
// will match any "child" routes, so we don't need to cover every route.
const Title = () => (
  <Switch>
    <Route
      path="/teams/:teamId/classrooms/new"
      component={() => <TitleText entity="team" />}
    />
    <Route
      path="/teams/:teamId/classrooms/:classroomId"
      component={() => <TitleText entity="classroom" />}
    />
    <Route
      path="/teams/:teamId"
      component={() => <TitleText entity="team" />}
    />
    <Route
      path="/organizations/:organizationId"
      component={() => <TitleText entity="organization" />}
    />
    <Route
      path="/users/:userId"
      component={() => <TitleText entity="user" />}
    />
    <Route
      path="/home/:programLabel/search"
      component={routeProps => {
        const { q: searchQuery } = fromSearch(routeProps);
        return (
          <TitleTextRender program={<span>&ldquo;{searchQuery}&rdquo;</span>}>
            Search
          </TitleTextRender>
        );
      }}
    />

    <Route
      path="/home"
      component={() => <TitleTextRender>Home</TitleTextRender>}
    />
  </Switch>
);

export default Title;
