import React from 'react';

import moment from 'moment';
import { dateFormat } from 'config';

import { Button, DatePicker, Icon } from 'antd';
const { RangePicker } = DatePicker;

const validateIconComponent = (start_date, end_date, validateFn, text) => {
  let validityClass = 'validate';
  let iconClass = 'fa fa-square-o';

  if (start_date && validateFn()) {
    validityClass = 'validate valid';
    iconClass = 'fa fa-check-square-o';
  }

  if (start_date && !validateFn()) {
    validityClass = 'validate invalid';
    iconClass = 'fa fa-exclamation-triangle';
  }

  return (
    <span className={validityClass}>
      <i className={iconClass} aria-hidden="true" /> {text}
    </span>
  );
};

class CycleRangePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,

      start_date: null,
      end_date: null,
      displayStartDate: null,
      displayEndDate: null,
    };
  }

  // This handles the newly mounted component case. I was having difficulty
  // in the case where you added a new cycle, when none had existed yet, and
  // the props weren't changing, the component was remounting, and so the
  // componentWillReceiveProps function wasn't running. We also need to do
  // the `inspect()` check below to make sure that null isn't being passed in
  // because we can't pass in a moment(null) date to the calendar component.
  // There might be a nicer way to do this, but I've spent all day just getting
  // this to work. Would like to DRY up this and the componentWillReceiveProps
  // code a bit.
  componentDidMount() {
    if (this.props.value) {
      const [start_date, end_date] = this.props.value;

      if (start_date && end_date) {
        this.setState({
          start_date,
          end_date,
          displayStartDate: start_date,
          displayEndDate: end_date,
        });
      }
    }
  }

  // We're using componentWillReceiveProps instead of contructor because
  // this component won't remount when displaying a new cycle.
  componentWillReceiveProps(nextProps) {
    if (!nextProps.value) {
      return;
    }

    const [start_date, end_date] = nextProps.value;

    this.setState({
      start_date, // to be submitted
      end_date, // to be submitted
      displayStartDate: start_date, // "draft" visible date
      displayEndDate: end_date, // "draft" visible date
    });
  }

  // displayStartDate = value
  // values from "outside" are set to displayStartDate/start_date
  // changes made within are set to displayStartDate
  // closing will set start_date to displayStartDate (undo-ing)
  // saving will validate displayStartDate, then submit displayStartDate, then
  // close

  isDateCycleLengthValid = () => {
    // Must be at least "2 weeks", from a Monday to Friday. This means that
    // our valid "2 weeks" are actually 11, 18, 25,... days apart. This is
    // 14 - 3, 21 - 3, 28 - 5,...

    // So, first let's find the difference in days between start and end.
    const diffInDays = Math.abs(
      moment(this.state.displayStartDate).diff(
        moment(this.state.displayEndDate),
        'days',
      ),
    );

    // Then, let's offset the minimum 11 days,...
    const offset = 11;
    const offsetDays = diffInDays - offset;

    // so we can test to make sure that we're at the

    if (
      // (1) minimum "2 weeks" and
      offsetDays >= 0 &&
      // (2) a Friday.
      offsetDays % 7 === 0
    ) {
      return true;
    }

    return false;
  };

  isDateDaysSelectedValid = () => {
    if (
      moment(this.state.displayStartDate).format('dddd') === 'Monday' &&
      moment(this.state.displayEndDate).format('dddd') === 'Friday'
    ) {
      return true;
    }

    return false;
  };

  CycleLengthIcon = () =>
    validateIconComponent(
      this.state.displayStartDate,
      this.state.displayEndDate,
      this.isDateCycleLengthValid,
      <span>at least 2 weeks</span>,
    );

  DaysSelectedIcon = () =>
    validateIconComponent(
      this.state.displayStartDate,
      this.state.displayEndDate,
      this.isDateDaysSelectedValid,
      <span>M-F</span>,
    );

  // NOTE not sure if race condition, maybe use toggle instead?
  // Going with this for our user testing, check more later.
  open = () => !this.state.open && this.setState({ open: true });

  close = () =>
    this.setState({
      // set open status flag, to close
      open: false,
      // and "undo" and unsaved date changes made by user
      displayStartDate: this.state.start_date,
      displayEndDate: this.state.end_date,
    });

  validate = () => {
    if (this.isDateCycleLengthValid() && this.isDateDaysSelectedValid()) {
      this.props.save([this.state.displayStartDate, this.state.displayEndDate]);
      this.close();
    }
  };

  onChange = ([displayStartDate, displayEndDate]) =>
    this.setState({ displayStartDate, displayEndDate });

  renderExtraFooter = () => (
    <div className="CycleRangePickerFooter">
      <div className="CycleRangePickerFooterText">
        Cycle:
        <this.DaysSelectedIcon />
        <this.CycleLengthIcon />
      </div>
      <div className="CycleRangePickerFooterActions">
        <Button size="small" type="danger" ghost onClick={this.close}>
          <Icon type="close-square" />
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={this.validate}
          disabled={
            !this.isDateCycleLengthValid() || !this.isDateDaysSelectedValid()
          }
        >
          Save
        </Button>
      </div>
    </div>
  );

  render() {
    const cycleRangePickerCloserClassName = this.state.open
      ? 'CycleRangePickerCloser show'
      : 'CycleRangePickerCloser';

    return (
      <div className="CycleRangePicker">
        <span onClick={this.open}>
          <RangePicker
            {...this.props}
            value={[this.state.displayStartDate, this.state.displayEndDate]}
            dateFormat={dateFormat}
            onChange={this.onChange}
            open={this.state.open}
            renderExtraFooter={this.renderExtraFooter}
          />
        </span>

        <div className={cycleRangePickerCloserClassName} onClick={this.close} />
      </div>
    );
  }
}

export default CycleRangePicker;
