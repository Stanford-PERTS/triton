// redux-form component for antd RangePicker.
// This version displays date only.

import React from 'react';
import PropTypes from 'prop-types';
import { change, touch } from 'redux-form';
import { CSSTransitionGroup } from 'react-transition-group';
import classnames from 'classnames';
import { dateFormat } from 'config';

import { DatePicker } from 'antd';
import FieldPickerWrapper from 'components/Form/FieldPickerWrapper';
import InfoBox from 'components/InfoBox';
import { InputFieldError } from 'components/Form/InputField';

import './styles.css';

const { RangePicker } = DatePicker;

class FieldRangePicker extends React.Component {
  updateValue = value => {
    const { dispatch, form } = this.props.meta;
    const { name } = this.props.input;
    const { names, update } = this.props;

    // redux-form doesn't sense antd's DatePicker onChange events, so we need to
    // manually dispatch a redux-form change action.
    // https://redux-form.com/7.4.2/docs/api/actioncreators.md/#-code-change-form-string-field-string-value-any-code-
    // Because RangePicker only takes in one value (an array of start and end
    // dates), we want to dispatch three updates on a change: one to update the
    // value for RangePicker and one each for the start and end date that are
    // the actual start_date and end_date of the cycle.
    dispatch(change(form, name, value)); // to update cycle_dates
    dispatch(change(form, names[0], value[0])); // to update start_date
    dispatch(change(form, names[1], value[1])); // to update end_date

    update(value[0], value[1]);
  };

  // redux-form doesn't sense when antd's DatePicker has been touched, so we
  // need to manually dispatch a redux-form change action. We are considering
  // a DatePicker to be touched when its status changes from open to closed.
  // If we just use onBlur, then validation error messages will display as soon
  // as the calendar is clicked open. This will cause them to display under the
  // calendar, which doesn't seem very useful.
  markTouched = isOpen => {
    if (!isOpen) {
      const { dispatch, form } = this.props.meta;
      const { name } = this.props.input;

      // https://redux-form.com/7.4.2/docs/api/actioncreators.md/#-code-touch-form-string-fields-string-code-
      dispatch(touch(form, name));
    }
  };

  render() {
    const {
      input,
      label,
      meta: { touched, error },
      readonly,
      type,
      // custom error messages
      isOverlapping,
      ...rest
    } = this.props;

    let { disabled } = this.props;
    if (readonly) {
      disabled = true;
    }

    const inputId = `${input.name}-field`;
    const rangePickerClasses = classnames({
      FieldRangePicker: true,
      [type]: true,
      readonly,
    });

    return (
      <FieldPickerWrapper>
        <div className={rangePickerClasses}>
          <div className="FieldRangePickerLabel">
            <label htmlFor={inputId}>{label}</label>
          </div>

          <div className="FieldRangePickerInput">
            <RangePicker
              {...rest}
              value={input.value}
              format={dateFormat}
              allowClear={false}
              disabled={disabled}
              onChange={this.updateValue}
              onOpenChange={isOpen => this.markTouched(isOpen)}
              className={classnames({
                error: touched && error,
              })}
            />

            {isOverlapping && (
              <InfoBox error>These dates overlap with other cycles.</InfoBox>
            )}

            <CSSTransitionGroup
              transitionName="TextFieldError"
              transitionEnterTimeout={700}
              transitionLeaveTimeout={205}
            >
              {touched && error && (
                <div className="TextFieldError">
                  {error.map(e => (
                    <InputFieldError key={e}>{e}</InputFieldError>
                  ))}
                </div>
              )}
            </CSSTransitionGroup>
          </div>
        </div>
      </FieldPickerWrapper>
    );
  }
}

FieldRangePicker.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  // Expressed as a class name on .FieldRangePicker
  type: PropTypes.string,
  // Triggers custom error message for dates that overlap other cycles.
  isOverlapping: PropTypes.bool,
  disabled: PropTypes.bool,
  // Also causes the field to be disabled, but with more readable styles.
  readonly: PropTypes.bool,
  validateFn: PropTypes.func,
  updateFn: PropTypes.func,
};

export default FieldRangePicker;
