// Example usage:
//
//   // Use the error message provided by the form saga. This error message will
//   // be wrapped in an <InfoBox error> component.
//   <FormSubmitFailed form={form} />
//
//   // Override the error message provided by the form saga. The child provided
//   // should contain all of the JSX needed to display. This is so that we can
//   // display any UI element here.
//   <FormSubmitFailed form={form}>
//     <InfoBox error>There was a problem saving.</InfoBox>
//   </FormSubmitFailed>
//
// The `form` prop will come from the reduxForm HOC (higher order component),
// specified by configuring:
//
//   reduxForm({
//     form: 'user',
//   })

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, setPropTypes } from 'recompose';
import selectors from 'state/selectors';

import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import InfoBox from 'components/InfoBox';
import Modal from 'components/Modal';
import Show from 'components/Show';

const FormSubmitFailed = ({ children, error, errorCode, handleSubmit }) => {
  const [conflictModalDismissed, setConflictModalDismissed] = useState(false);

  return (
    <div data-test="submitFailed">
      {error && (children || <InfoBox error>{error}</InfoBox>)}
      <Show when={errorCode === 409 && !conflictModalDismissed}>
        <Modal title="Conflict with team member's responses">
          <p>
            Someone on another device has changed the responses on this page. If
            you choose to save, your version will overwrite their version.
          </p>
          <p>
            We recommend you choose &ldquo;Cancel&rdquo;, copy your responses to
            your personal notes, and refresh the page to see the changes.
          </p>
          <ButtonContainer>
            <Button
              cancel
              onClick={() => setConflictModalDismissed(true)}
              data-test="conflict-cancel-button"
            >
              Cancel
            </Button>
            <Button
              caution
              onClick={handleSubmit}
              data-test="conflict-override-button"
            >
              Discard Their Responses and Save Mine
            </Button>
          </ButtonContainer>
        </Modal>
      </Show>
    </div>
  );
};

FormSubmitFailed.propTypes = {
  // Override the error message provided by the form saga.
  children: PropTypes.node,
  // Error message provided by redux-form error prop. (via redux-form-saga)
  error: PropTypes.string,
  // Error code from server, if provided by this form saga.
  errorCode: PropTypes.number,
  // Submits the containing form, may be provided to handle conflicts.
  handleSubmit: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  error: selectors.form.error(state, props),
  errorCode: selectors.form.errorCode(state, props),
});

export default compose(
  connect(mapStateToProps),
  setPropTypes({
    // Override the error message provided by the form saga.
    children: PropTypes.node,
    // Error message provided by redux-form error prop. (via redux-form-saga)
    error: PropTypes.string,
  }),
)(FormSubmitFailed);
