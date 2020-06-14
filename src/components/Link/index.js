// Link that also works for external URL's
// Adapted from: https://github.com/ReactTraining/react-router/issues/1147

import React from 'react';
import isExternal from 'utils/isExternal';
import PropTypes from 'prop-types';
import uri from 'urijs';
import withParams from './withParams';
import { compose, setPropTypes } from 'recompose';
import { withRouter } from 'react-router-dom';

import { logToSentry } from 'services';

import ExternalAnchor from './ExternalAnchor';
import ReactRouterLink from './ReactRouterLink';

const Link = props => {
  const { Component, externalLink, to } = props;

  let LinkComponent = Component || ReactRouterLink;

  const linkProps = {
    ...props,
    // Allows us to provide a custom Component for styling, while still render
    // a react-router Link. Most likely, we'll be providing a styled `button`
    // component but, for HTML validity, we can't wrap a `button` (interactive)
    // element inside an `a` element. Instead, we use the styles from the
    // `button` component rendered `as` the `a` element.
    // https://www.styled-components.com/docs/api#as-polymorphic-prop
    as: ReactRouterLink,
  };

  // For external links, we render a special component.
  if (isExternal(to) || externalLink) {
    // This includes "static" files from /src/assets, which aren't actually
    // external, but we do want target="_blank" and the ExternalAnchor
    // component.
    LinkComponent = ExternalAnchor;
    linkProps.to = undefined;
    linkProps.as = undefined;
    linkProps.href = to;
    linkProps.target = '_blank';

    if (isExternal(to)) {
      // This only applies to hrefs that are actually external and require a
      // protocol.
      // We don't want to `throw` here b/c it's not helpful to break the app;
      // instead alert the devs so they can fix the link.
      if (uri(to).protocol() !== 'https') {
        logToSentry(`External links must be https, got: ${to}`);
      }

      // This protects us against scripts on pages we may link to.
      // https://mathiasbynens.github.io/rel-noopener/
      linkProps.rel = 'noopener noreferrer';
    }
  }

  return <LinkComponent {...linkProps} />;
};

export default compose(
  setPropTypes({
    // Custom Component to render this Link as
    Component: PropTypes.object,
    // Set if this link is to an external URL.
    externalLink: PropTypes.bool,
    // The route or URL to link to.
    to: PropTypes.string.isRequired,
  }),
  withRouter,
  withParams,
)(Link);
