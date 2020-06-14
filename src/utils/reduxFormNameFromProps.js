// reduxFormNameFromProps allows you to easily provide a `form` name to a
// redux-form that is dynamically generated from the props.
//
// If you need to render the same form component multiple times, but each of the
// forms is being provided different data, then each form needs to have a
// different `form` prop provided.
//
// export default compose(
//   reduxFormNameFromProps(({ cycle }) => `cycleDateRange:${cycle.uid}`),
//   reduxForm(),
// )(TaskInputCycleDateRange);

import React from 'react';
import { getDisplayName, setDisplayName } from 'utils/displayName';

const reduxFormNameFromProps = propsToForm => BaseComponent => {
  const ReduxFormNameFromProps = props => {
    const formName = propsToForm(props);
    return <BaseComponent {...props} form={formName} />;
  };

  setDisplayName(
    ReduxFormNameFromProps,
    `reduxFormNameFromProps(${getDisplayName(BaseComponent)})`,
  );

  return ReduxFormNameFromProps;
};

export default reduxFormNameFromProps;
