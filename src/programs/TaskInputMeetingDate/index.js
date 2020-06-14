// Inline updating of cycle.meeting_datetime

import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as cycleActions from 'state/cycles/actions';
import { withAllContexts } from 'programs/contexts';
import { reduxForm, Field } from 'redux-form';

import FieldDateTimePicker from 'components/Form/FieldDateTimePicker';

class TaskInputMeetingDate extends React.Component {
  isWithinCurrentCycle = date => {
    if (!date) {
      return false;
    }

    const { cycle } = this.props;

    return date.isBetween(cycle.start_date, cycle.end_date, 'date', '[]');
  };

  disabledDate = date => !this.isWithinCurrentCycle(date);

  updateMeetingDateTime = datetime => {
    const { cycle } = this.props;
    const { updateCycle } = this.props.actions;

    const updatedCycle = {
      ...cycle,
      meeting_datetime: datetime,
    };

    updateCycle(updatedCycle);
  };

  clearTime = () => {
    this.updateMeetingDateTime(null);
  };

  render() {
    const { task } = this.props;
    const { mayEdit } = task;

    return (
      <div className="TaskInputMeetingDate">
        <Field
          component={FieldDateTimePicker}
          className="FieldMeetingDateTime"
          label="Date and Time"
          name={task.name || 'meeting_datetime'}
          type="date"
          disabled={!mayEdit}
          disabledDate={this.disabledDate}
          update={this.updateMeetingDateTime}
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
  withAllContexts,
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
)(TaskInputMeetingDate);
