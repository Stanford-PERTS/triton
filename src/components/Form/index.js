// Form is to be used in place of `form` so that we can inject our app
// `maxLengthGlobal` and `required` validate rules.
//
// The `required` rule will be added to `Field`s with the `required` prop.
// See usage in `src/scenes/TaskModule/EPImplementationAgreement.js`

import React from 'react';
import { Field } from 'redux-form';
import { maxLengthGlobal, required as requiredValidate } from 'utils/validate';
import reactRecursiveMap from 'utils/reactRecursiveMap';

const Form = props => {
  const children = reactRecursiveMap(props.children, child => {
    const { type } = child;
    const { required, validate = [] } = child.props;

    let validateRules = Array.isArray(validate) ? validate : [validate];

    // Always add the maxLengthGlobal validate rule.
    if (type === Field) {
      validateRules = [...validateRules, maxLengthGlobal];
    }

    // If the Field is marked as `required`, add required validate rule.
    if (type === Field && required) {
      validateRules = [...validateRules, requiredValidate];
    }

    return React.cloneElement(child, {
      validate: validateRules,
    });
  });

  return <form {...props} children={children} />;
};

export default Form;
