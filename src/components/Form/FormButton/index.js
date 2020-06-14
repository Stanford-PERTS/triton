import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from 'components/Button';

const MarginButton = styled(Button)`
  &,
  &:active {
    margin-top: 1em;
  }
`;

/**
 * A submit button which calls a handler, optionally with a second
 * confirmation step (to use, specify props `confirmationPrompt` and
 * `confirmationButtonText`).
 * @returns {Object} FormButton
 */
class FormButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = { confirmationActive: false };
  }

  _handleSubmit = () => {
    this.setState({ confirmationActive: false });
    this.props.handleSubmit();
  };

  toggleConfirmation = () =>
    this.setState({ confirmationActive: !this.state.confirmationActive });

  render() {
    const {
      children,
      maySubmit,
      confirmationPrompt,
      confirmationButtonText,
      submittable,
      submitting,
    } = this.props;

    // This is the one the user always sees first. It submits if no
    // confirmation was requested.
    const InitialButton = () => (
      <Button
        onClick={
          confirmationPrompt ? this.toggleConfirmation : this._handleSubmit
        }
        disabled={!submittable || !maySubmit || submitting}
        loading={submitting}
        loadingText="Submitting"
        data-test="form-button-initial"
      >
        {children}
      </Button>
    );

    // These buttons are only used if confirmation is requested.
    const CancelButton = () => (
      <MarginButton
        onClick={this.toggleConfirmation}
        cancel
        data-test="form-button-cancel"
      >
        No, I&rsquo;ve changed my mind.
      </MarginButton>
    );
    const ConfirmationButton = () => (
      <MarginButton
        onClick={this._handleSubmit}
        disabled={!submittable || !maySubmit || submitting}
        loading={submitting}
        loadingText="Submitting"
        data-test="form-button-confirmation"
      >
        {confirmationButtonText}
      </MarginButton>
    );

    return (
      <div>
        {!this.state.confirmationActive && <InitialButton />}
        {confirmationPrompt && this.state.confirmationActive && (
          <div>
            <div>{confirmationPrompt}</div>
            <CancelButton />
            <ConfirmationButton />
          </div>
        )}
      </div>
    );
  }
}

FormButton.defaultProps = {
  maySubmit: true,
  submittable: true,
  submitting: false,
};

FormButton.propTypes = {
  children: PropTypes.node.isRequired, // button text
  handleSubmit: PropTypes.func.isRequired,
  maySubmit: PropTypes.bool,
  confirmationPrompt: PropTypes.node,
  confirmationButtonText: PropTypes.node,
  submittable: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default FormButton;
