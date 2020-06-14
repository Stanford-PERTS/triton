// Inline updating of cycle.resolution_date

import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as cycleActions from 'state/cycles/actions';
import { withAllContexts } from 'programs/contexts';
import { reduxForm, Field } from 'redux-form';

import FieldDatePicker from 'components/Form/FieldDatePicker';

class TaskInputResolutionDate extends React.Component {
  isWithinCurrentCycle = date => {
    if (!date) {
      return false;
    }

    const { cycle } = this.props;

    return date.isBetween(cycle.start_date, cycle.end_date, 'date', '[]');
  };

  disabledDate = date => !this.isWithinCurrentCycle(date);

  updateResolutionDate = datetime => {
    const { cycle, task } = this.props;
    const { updateCycle } = this.props.actions;
    const { mayEdit } = task;

    if (mayEdit) {
      const updatedCycle = {
        ...cycle,
        resolution_date: datetime,
      };

      updateCycle(updatedCycle);
    }
  };

  clearTime = () => {
    this.updateResolutionDate(null);
  };

  render() {
    const { task } = this.props;
    const { mayEdit } = task;

    return (
      <div className="TaskInputResolutionDate">
        <Field
          component={FieldDatePicker}
          className="FieldResolutionDate"
          label="Due On"
          name="resolution_date"
          type="date"
          disabled={!mayEdit}
          disabledDate={this.disabledDate}
          onChange={this.updateResolutionDate}
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
    form: 'cycleResolutionDate',
    // Needs to be enabled so that the field is updated when navigating between
    // different steps/cycles.
    enableReinitialize: true,
    // If the form is destroyed on unmount, then it doesn't get recreated with
    // the input field receiving the initialValues when navigating between
    // different steps/cycles.
    destroyOnUnmount: false,
  }),
)(TaskInputResolutionDate);
