// Inline updating of cycle.meeting_datetime

import moment from 'moment/moment';
import React from 'react';
import { bindActionCreators } from 'redux';
import { branch, compose, renderComponent } from 'recompose';
import { connect } from 'react-redux';

import * as cycleActions from 'state/cycles/actions';
import reduxFormNameFromProps from 'utils/reduxFormNameFromProps';
import selectors from 'state/selectors';
import { reduxForm, Field } from 'redux-form';
import getWeekdayValidator from './validate';
import { withAllContexts } from 'programs/contexts';

import FieldRangePicker from 'components/Form/FieldRangePicker';

class TaskInputCycleDateRange extends React.Component {
  componentDidMount() {
    this.setDefaultDates();
  }

  /**
   * If cycle doesn't have dates set when the user opens the scene, if there's
   * a props.getDefaultDates function, and if it finds dates, then save these
   * to the cycle.
   * @returns {undefined}
   */
  setDefaultDates() {
    const { cycle, cycles, getDefaultDates } = this.props;

    if (!getDefaultDates) {
      return;
    }

    const { startDate, endDate } = getDefaultDates(cycle, cycles);
    if (!startDate || !endDate) {
      return;
    }

    this.updateCycleDateRange(startDate, endDate);
  }

  isWithinOtherCycle = date => {
    const { cycles, cycle } = this.props;

    // Return true if the `date` provided is within any cycle's
    // start_date - end_date range.
    for (let i = 0; i < cycles.length; i += 1) {
      // don't disable dates the date range that belongs to the
      // cycle that user is attempting to change
      if (cycles[i].uid === cycle.uid) {
        continue;
      }

      if (!cycles[i].start_date || !cycles[i].end_date) {
        // If a cycle has no start or end date, than the date in question
        // cannot be within the cycle.
        return false;
      }

      if (
        date.isBetween(cycles[i].start_date, cycles[i].end_date, 'day', '[]')
      ) {
        return true;
      }
    }

    return false;
  };

  isWithin2019DateRange = date => {
    // @todo: make date boundaries part of the program object in the db, #1343
    const startDate = moment('2019-08-01');
    const endDate = moment('2020-06-30');

    if (date >= startDate && date <= endDate) {
      return true;
    }

    return false;
  };

  disabledDate = date =>
    this.isWithinOtherCycle(date) || !this.isWithin2019DateRange(date);

  updateCycleDateRange = (start_date, end_date) => {
    const { cycle, task, validate } = this.props;
    const { updateCycle } = this.props.actions;
    const { mayEdit } = task;

    if (mayEdit) {
      const updatedCycle = {
        ...cycle,
        start_date,
        end_date,
        // used by validate
        cycle_dates: [start_date, end_date],
      };

      // Reuse the redux-form validate function to make sure the dates selected
      // are valid before we call the update function.
      //
      // Why don't we just use the redux-form errors prop? Because the
      // redux-form errors prop isn't updated until multiple async dispatched
      // actions occur, which won't happen by the time we need a decision here.
      const errors = validate(updatedCycle);

      if (!errors.cycle_dates) {
        updateCycle(updatedCycle);
      }
    }
  };

  render() {
    const { label, task, updating, validate } = this.props;
    const { mayEdit } = task;

    return (
      <div className="TaskInputCycleDateRange">
        <Field
          component={FieldRangePicker}
          className="FieldCycleDateRange"
          label={
            label === undefined ? 'The survey window is open for dates:' : label
          }
          name="cycle_dates"
          names={['start_date', 'end_date']}
          type="date"
          readonly={!mayEdit || updating}
          disabledDate={this.disabledDate}
          update={this.updateCycleDateRange}
          validateFn={validate}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const program = props.program || {};
  // Default to zero so if we don't have config yet, don't show any errors.
  const validate = getWeekdayValidator(program.min_cycle_weekdays || 0);

  return {
    initialValues: props.cycle,
    formValues: selectors.form.values(state, props),
    validate,
    updating: selectors.updating.cycles(state, { cycleId: props.cycle.uid }),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(cycleActions, dispatch),
});

export default compose(
  withAllContexts,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  // Switch to displaying a much simpler component in summary mode. The
  // reduxForm wrapper has been determined to hurt performance on the org
  // dashboard.
  branch(
    ({ display }) => display === 'summary',
    renderComponent(({ cycle, display }) => (
      <>
        {cycle.start_date ? cycle.start_date.format('l') : '(not set)'} &ndash;{' '}
        {cycle.end_date ? cycle.end_date.format('l') : '(not set)'}
      </>
    )),
  ),
  // The form name needs to be dynamic since we might be rendering multiple
  // instances at the same time (in the community dashboard, for example).
  reduxFormNameFromProps(({ cycle }) => `cycleDateRange:${cycle.uid}`),
  reduxForm({
    // validate, // passed in as a prop, see mapStateToProps
    // Needs to be enabled so that the field is updated when navigating between
    // different steps/cycles.
    enableReinitialize: true,
    // If the form is destroyed on unmount, then it doesn't get recreated with
    // the input field receiving the initialValues when navigating between
    // different steps/cycles.
    destroyOnUnmount: false,
  }),
)(TaskInputCycleDateRange);
