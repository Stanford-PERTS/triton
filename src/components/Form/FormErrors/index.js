// FormErrors displays all of the errors in the form. This can be used when you
// want to display all the errors in once place (for example, near a submit
// button) instead each individual error near its corresponding input field.
//
// <FormErrors form={form} />

import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import selectors from 'state/selectors';

import InfoBox from 'components/InfoBox';

const FormErrors = ({ formErrors = [] }) => (
  <>
    {formErrors.map(({ fieldName, errorMsg }) => (
      <InfoBox error key={fieldName}>
        {errorMsg}
      </InfoBox>
    ))}
  </>
);

const mapStateToProps = (state, props) => {
  const syncErrors = selectors.form.syncErrors(state, props) || {};

  const formErrors = Object.keys(syncErrors).map(fieldName => ({
    // For the `key` prop since we'll be mapping over errors.
    fieldName,
    // The actual error message we'll be displaying.
    errorMsg: syncErrors[fieldName],
  }));

  return { formErrors };
};

export default compose(connect(mapStateToProps))(FormErrors);
