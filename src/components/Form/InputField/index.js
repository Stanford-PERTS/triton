import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import theme from 'components/theme';
import RequiredLabel from 'components/Form/RequiredLabel';

const InputFieldStyled = styled.div`
  position: relative;
  padding-bottom: 32px;
  font-size: 14px;

  /* CSSTransitionGroup Animations */
  .TextFieldError-enter {
    max-height: 0px;
  }

  .TextFieldError-enter.TextFieldError-enter-active {
    max-height: 30px;
    transition-property: all;
    transition-duration: 700ms;
    transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  }

  .TextFieldError-leave {
    max-height: 30px;
    overflow-y: hidden;
  }

  .TextFieldError-leave.TextFieldError-leave-active {
    max-height: 0;
    opacity: 0.01;
    transition-property: all;
    transition-duration: 500ms;
    transition-timing-function: cubic-bezier(0.17, 0.71, 0.72, 0.98);
  }

  /* Hide number spinner buttons, which are too small to use anyway. */
  .TextField.number .TextFieldInput input::-webkit-outer-spin-button,
  .TextField.number .TextFieldInput input::-webkit-inner-spin-button {
    display: none;
  }
  .TextField.number .TextFieldInput input[type='number'] {
    -moz-appearance: textfield;
  }
`;

const InputFieldLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
`;

const InputFieldInput = styled.div`
  margin-bottom: 2px;
`;

const InputFieldErrorSpacing = styled.div`
  position: absolute;

  left: 0;
  right: 0;
`;

export const InputFieldError = styled.div`
  position: relative;

  width: 100%;
  margin: 0 0 7px 0;
  padding: 5px;

  border-radius: ${theme.units.borderRadius};

  color: ${theme.palette.white};
  background: ${theme.palette.red};

  text-align: center;
  font-size: 13px;
`;

const InputField = props => {
  const {
    children,
    id,
    label,
    meta: { touched, error },
    required,
  } = props;

  return (
    <InputFieldStyled>
      {label && (
        <InputFieldLabel htmlFor={id}>
          {label} {required && <RequiredLabel />}
        </InputFieldLabel>
      )}
      <InputFieldInput>{children}</InputFieldInput>
      <InputFieldErrorSpacing>
        <CSSTransitionGroup
          transitionName="TextFieldError"
          transitionEnterTimeout={700}
          transitionLeaveTimeout={205}
        >
          {touched && error && <InputFieldError>{error}</InputFieldError>}
        </CSSTransitionGroup>
      </InputFieldErrorSpacing>
    </InputFieldStyled>
  );
};

export default InputField;
