// reduxFormInitialValuesFromProps allows you to provide `initialValues` to a
// redux-form that is dynamically generated from the props without using
// mapStateToProps.
//
// This is useful when you are passing in all props to a component and not
// connecting your component.
//
// export default compose(
//   reduxFormInitialValuesFromProps([
//     'isInviting',
//     'isRemoving',
//     'organization',
//     'user',
//   ]),
//   reduxForm(),
// )(WrappedComponent);
//
// This will result in initialValues provided to the reduxForm like:
//
// {
//   isInviting: props.isInviting,
//   isRemoving: props.isRemoving,
//   organization: props.organization,
//   user: props.user,
// }

import React from 'react';
import { getDisplayName, setDisplayName } from 'utils/displayName';

const reduxFormInitialValuesFromProps = (propsToForm = []) => BaseComponent => {
  const ReduxFormInitialValuesFromProps = props => {
    const initialValues = props.initialValues || {};

    propsToForm.forEach(propName => {
      initialValues[propName] = props[propName];
    });

    return <BaseComponent {...props} initialValues={initialValues} />;
  };

  setDisplayName(
    ReduxFormInitialValuesFromProps,
    `reduxFormInitialValuesFromProps(${getDisplayName(BaseComponent)})`,
  );

  return ReduxFormInitialValuesFromProps;
};

export default reduxFormInitialValuesFromProps;
