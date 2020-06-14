// redux-form component for antd DatePicker.
// This version displays datetime.
import React from 'react';
import { change, touch } from 'redux-form';
import { CSSTransitionGroup } from 'react-transition-group';
import classnames from 'classnames';
import { dateTimeFormat } from 'config';
import { DatePicker } from 'antd';
import FieldPickerWrapper from 'components/Form/FieldPickerWrapper';
import InfoBox from 'components/InfoBox';
import './styles.css';

class FieldDateTimePicker extends React.Component {
  // redux-form doesn't sense antd's DatePicker onChange events, so we need to
  // manually dispatch a redux-form change action.
  updateValue = value => {
    const { dispatch, form } = this.props.meta;
    const { name } = this.props.input;

    // https://redux-form.com/7.4.2/docs/api/actioncreators.md/#-code-change-form-string-field-string-value-any-code-
    dispatch(change(form, name, value));
  };

  onOpenChange = isOpen => {
    if (!isOpen) {
      const { dispatch, form } = this.props.meta;
      const { name, value } = this.props.input;
      const { update } = this.props;

      // redux-form doesn't sense when antd's DatePicker has been touched, so we
      // need to manually dispatch a redux-form change action. We are
      // considering a DatePicker to be touched when its status changes from
      // open to closed. If we just use onBlur, then validation error messages
      // will display as soon as the calendar is clicked open. This will cause
      // them to display under the calendar, which doesn't seem very useful.
      // https://redux-form.com/7.4.2/docs/api/actioncreators.md/#-code-touch-form-string-fields-string-code-
      dispatch(touch(form, name));

      // Whenever the DatePicker is closed, from either clicking the Ok button
      // or clicking off the DatePicker (onBlur), we want to update.
      update(value);
    }
  };
  render() {
    const {
      disabled,
      input,
      label,
      type,
      meta: { touched, error },
      // custom error messages
      isOverdue,
      isOutOfCycleRange,
      ...rest
    } = this.props;
    const inputId = `${input.name}-field`;
    return (
      <FieldPickerWrapper>
        <div className={classnames('FieldDateTimePicker', type)}>
          <div className="FieldDateTimePickerLabel">
            <label htmlFor={inputId}>{label}</label>
          </div>
          <div className="FieldDateTimePickerInput">
            <DatePicker
              // We are using a custom clear button since DatePicker doesn't
              // provide the ability to hook into clicking the built-in clear
              // button.
              allowClear={false}
              {...rest}
              value={input.value || undefined}
              format={dateTimeFormat}
              showTime={{ format: 'h:mm a', use12Hours: true }}
              disabled={disabled}
              onChange={this.updateValue}
              onOpenChange={isOpen => this.onOpenChange(isOpen)}
              className={classnames({
                error: touched && error,
                overdue: isOverdue,
              })}
            />
            {isOverdue && <span className="overdue">overdue</span>}
            {isOutOfCycleRange && (
              <InfoBox error>
                <i className="fa fa-warning" />
                Date should be within cycle dates.
              </InfoBox>
            )}
            <CSSTransitionGroup
              transitionName="TextFieldError"
              transitionEnterTimeout={700}
              transitionLeaveTimeout={205}
            >
              {touched && error && (
                <div className="TextFieldError">{error}</div>
              )}
            </CSSTransitionGroup>
          </div>
        </div>
      </FieldPickerWrapper>
    );
  }
}

export default FieldDateTimePicker;
