// Example usage:
//
//   <FormSubmitSucceeded form={form}>
//     Successfully saved.
//   </FormSubmitSucceeded>
//
// The `form` prop will come from the reduxForm HOC (higher order component),
// specified by configuring:
//
//   reduxForm({
//     form: 'user',
//   })

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, defaultProps, setPropTypes } from 'recompose';
// https://redux-form.com/6.6.3/docs/api/selectors.md/
import { isDirty, hasSubmitSucceeded } from 'redux-form';

class FormSubmitSucceeded extends React.Component {
  constructor() {
    super();

    this.state = {
      displaySuccess: false,
    };

    this.timerId = null;
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.submitSucceeded &&
      this.props.dirty &&
      this.state.displaySuccess
    ) {
      // If the user begins editing the form while the success message is being
      // displayed, we want to clear the success message. Since submitSucceeded
      // will remain true after a successful form submit even when the user has
      // made new changes to the form, we can check for both submitSucceeded and
      // dirty to indicate this scenario.
      this.setState({ displaySuccess: false });
    }

    if (!prevProps.submitSucceeded && this.props.submitSucceeded) {
      // Clear out any existing timers so that if a form is successfully
      // submitted a second time before the timer runs down, we can restart the
      // timer fresh.
      clearTimeout(this.timerId);

      this.setState({ displaySuccess: true });

      // The success message will display for a default of 6 seconds. You can
      // override this timeout by passing in the number of seconds you would
      // like to display success message for via the `timeout` prop;

      if (this.props.timeout === Infinity) {
        // Don't timeout success message, display forever.
        return;
      }

      const displayFor = this.props.timeout * 1000;

      this.timerId = setTimeout(() => {
        this.setState({ displaySuccess: false });
      }, displayFor);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timerId);
  }

  render() {
    const { children } = this.props;
    const { displaySuccess } = this.state;

    return <div data-test="submitSucceeded">{displaySuccess && children}</div>;
  }
}

const mapStateToProps = (state, props) => ({
  dirty: isDirty(props.form)(state),
  submitSucceeded: hasSubmitSucceeded(props.form)(state),
});

export default compose(
  connect(mapStateToProps),
  setPropTypes({
    // The success message that will be displayed.
    children: PropTypes.node.isRequired,
    // The number of seconds you would like to display the success message for.
    timeout: PropTypes.number,
  }),
  defaultProps({
    timeout: 6,
  }),
)(FormSubmitSucceeded);
