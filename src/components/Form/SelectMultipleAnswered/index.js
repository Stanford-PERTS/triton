// The SelectMultipleAnswered component accompanies the SelectMultipleField
// component. It renders the display labels corresponding to the values that the
// user has selected for the provided field.
//
// Example usage:
//
//   const options = [
//     { value: 'option1', label: <span>option text</span> },
//     { value: 'option2', label: <span>option text</span> },
//     { value: 'option3', label: <span>option text</span> },
//   ];
//
//   <Field
//     name="why-do-you-teach"
//     label="Please select"
//     component={SelectMultipleField}
//     options={options}
//   />
//
//   <p>You selected:</p>
//
//   <SelectMultipleAnswered
//     name="why-do-you-teach"
//     options={options}
//     response={response}
//   />

import React from 'react';
import { compose, defaultProps } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import { withResponseContext } from 'programs/contexts';
import { bodyToFormValues } from 'state/responses/helpers';

const SelectMultipleAnswered = props => {
  const { options = [], name, response } = props;
  const responseValues = bodyToFormValues(response.body);
  const value = responseValues[name];

  if (!Array.isArray(value) || value.length === 0) {
    return (
      <ul>
        <li>No options were selected.</li>
      </ul>
    );
  }

  return (
    <ul>
      {options.map(
        (option, index) =>
          value.indexOf(option.value) !== -1 && (
            <li key={option.value}>{option.label}</li>
          ),
      )}
    </ul>
  );
};

const mapStateToProps = (state, props) => {
  const { parentLabel, moduleLabel } = props;

  // If parentLabel and moduleLabel props have been provided, then we'll need to
  // look at user/team responses to find desired response.
  if (parentLabel && moduleLabel) {
    return {
      response:
        // We don't have Task props here, so assume if there is a User response
        // that it's a User responseType, else return the Team responseType.
        selectors.responses.user.module.step(state, props) ||
        selectors.responses.team.step.module.shared(state, props),
    };
  }

  // If parentLabel and moduleLabel props have *not* been provided, then assume
  // that the response from context is what we want to use.
  return {
    response: props.response,
  };
};

export default compose(
  withRouter,
  withResponseContext,
  connect(mapStateToProps),
  defaultProps({
    response: {
      body: {},
    },
  }),
)(SelectMultipleAnswered);
