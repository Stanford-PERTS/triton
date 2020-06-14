// reduxFormOnSubmit is a companion HOC to redux-form's reduxForm when using
// redux-form-saga. redux-form-saga provides an action creator function that we
// would like to provide to the `onSubmit` option of the reduxForm config.
// Unfortunately, as provided, the only values that end up being provided to the
// receiving form handling saga are the form values. Many times we also need
// additional values, like `team` or `organization`. This HOC allows us to pack
// up additional data into the dispatched action created by redux-form-saga.
//
// Example usage:
//   import actionFn from 'state/form/teamUserInvite/actions';
//   compose(
//     connect(mapStateToProps), // which will provided `team`
//     reduxFormOnSubmit(actionFn, { propsToInclude: ['team'] }),
//     reduxForm({
//       form: 'user',
//       enableReinitalize: true,
//     }),
//   )
//
//  Result, the `payload` provided to your form handling saga will contain:
//    {
//      formValues: formValues,
//      team: { uid: 'Team_001', ... },
//    }
//
// Note:
//   - reduxFormOnSubmit needs to appear before reduxForm in the list of
//     connected functions. reduxForm expects onSubmit, if not provided via the
//     config, the be passed in via props.

import React from 'react';

/**
 * @param  {function} actionFn          redux-form-saga action creator function
 * @param  {array}    propsToInclude    name of React props to pack into
 *                                      dispatched action
 * @return {function}                   [description]
 */

const reduxFormOnSubmit = (
  actionFn,
  { propsToInclude } = { propsToInclude: [] },
) => BaseComponent => props => {
  const actionFnWithParams = (formValues, dispatch, formComponentProps) => {
    const repackedFormValues = { formValues };

    propsToInclude.forEach(p => (repackedFormValues[p] = props[p]));

    // Useful to include the current form, e.g. to use selectors in the saga.
    repackedFormValues.form = formComponentProps.form;

    return actionFn(repackedFormValues, dispatch, formComponentProps);
  };

  return <BaseComponent {...props} onSubmit={actionFnWithParams} />;
};

export default reduxFormOnSubmit;
