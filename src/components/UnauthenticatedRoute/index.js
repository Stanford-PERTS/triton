import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

import * as routes from 'routes';
import fromSearch from 'utils/fromSearch';

export const UnauthenticatedRoute = routeProps => {
  const {
    authenticated,
    component: Component,
    props: cProps,
    ...rest
  } = routeProps;
  const { continue_url, program } = fromSearch(routeProps);

  let to;
  if (continue_url) {
    to = continue_url;
  } else if (program) {
    // Wait, you say, why pass `program` to a "no program" scene? This version
    // of the home scene differentiates between a program in the search, which
    // may trigger fancy redirects that are intended only to affect people
    // logging in. If the program is in the path (toHome), these redirects don't
    // happen
    to = `${routes.toHomeNoProgram()}?program=${program}`;
  } else {
    to = routes.toHomeNoProgram();
  }

  return (
    <Route
      {...rest}
      render={props =>
        authenticated ? (
          // Redirect priority:
          // 1) a provided continue_url
          // 2) a redirect provided auth redirect
          // 3) default to home
          <Redirect to={to} />
        ) : (
          <Component {...props} {...cProps} />
        )
      }
    />
  );
};

UnauthenticatedRoute.propTypes = {
  authenticated: PropTypes.bool,
  // expecting React.Component or Stateless Functional Component
  component: PropTypes.func.isRequired,
  props: PropTypes.object,
};

UnauthenticatedRoute.defaultProps = {
  authenticated: false,
};

export default UnauthenticatedRoute;
