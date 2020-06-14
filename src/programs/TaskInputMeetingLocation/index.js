// Inline updating of cycle.meeting_location

import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as cycleActions from 'state/cycles/actions';
import { withCycleContext, withTaskContext } from 'programs/contexts';
import { reduxForm, Field } from 'redux-form';
import TextField from 'components/Form/TextField';

class TaskInputMeetingLocation extends React.Component {
  onChange = e => {
    const { cycle } = this.props;
    const { updateCycle } = this.props.actions;

    const updatedCycle = {
      ...cycle,
      meeting_location: e.target.value,
    };

    updateCycle(updatedCycle);
  };

  render() {
    const { task } = this.props;
    const { mayEdit } = task;

    return (
      <div className="TaskInputMeetingLocation">
        <Field
          name="meeting_location"
          type="text"
          label="Location (optional)"
          component={TextField}
          placeholder="Enter meeting location"
          data-test="meeting_location"
          onBlur={this.onChange}
          disabled={!mayEdit}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  initialValues: props.cycle,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(cycleActions, dispatch),
});

export default compose(
  withCycleContext,
  withTaskContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  reduxForm({
    form: 'cycleMeetingLocation',
    // Needs to be enabled so that the field is updated when navigating between
    // different steps/cycles.
    enableReinitialize: true,
    // If the form is destroyed on unmount, then it doesn't get recreated with
    // the input field receiving the initialValues when navigating between
    // different steps/cycles.
    destroyOnUnmount: false,
  }),
)(TaskInputMeetingLocation);
