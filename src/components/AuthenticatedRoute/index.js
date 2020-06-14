import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import uri from 'urijs';

import { toLogin } from 'routes';

const AuthenticatedRoute = routeProps => {
  const {
    authenticated,
    component: Component,
    location,
    props: cProps,
    redirectTo,
    ...rest
  } = routeProps;

  const pathname = uri(redirectTo)
    .setSearch({ continue_url: location.pathname })
    .toString();

  return (
    <Route
      {...rest}
      render={props =>
        authenticated ? (
          <Component {...props} {...cProps} />
        ) : (
          <Redirect to={pathname} />
        )
      }
    />
  );
};

export default AuthenticatedRoute;

AuthenticatedRoute.propTypes = {
  authenticated: PropTypes.bool,
  // expecting React.Component or Stateless Functional Component
  component: PropTypes.func.isRequired,
  props: PropTypes.object,
  redirectTo: PropTypes.string,
};

AuthenticatedRoute.defaultProps = {
  authenticated: false,
  redirectTo: toLogin(),
};
