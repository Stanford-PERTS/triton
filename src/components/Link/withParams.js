import React from 'react';
import { getDisplayName, setDisplayName } from 'utils/displayName';
import forEach from 'lodash/forEach';

// Replace any unspecified route params with any route params that we can find
// that have been parsed by react-router.
const withParams = BaseComponent => {
  const WithParams = props => {
    // Remove react-router props so we're not passing these into Link
    const { staticContext, history, location, match, to, ...rest } = props;
    const { params } = props.match;

    let magicTo = to;
    forEach(params, (value, prop) => {
      magicTo = magicTo.replace(`:${prop}`, value);
    });

    return <BaseComponent {...rest} to={magicTo} />;
  };

  setDisplayName(WithParams, `withParams(${getDisplayName(BaseComponent)})`);

  return WithParams;
};

export default withParams;
