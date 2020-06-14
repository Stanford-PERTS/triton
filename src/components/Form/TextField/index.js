import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import InputField from 'components/Form/InputField';

export const InputStyled = styled.input`
  width: 100%;

  padding: 7px;

  border: 1px solid #4a4a4a;
  border-radius: 3px;

  &:disabled {
    background-color: #eaeaea;
    cursor: not-allowed;
  }

  &.error {
    border: 1px solid ${theme.palette.red};
  }
`;

const TextField = props => {
  const {
    disabled,
    input,
    meta: { touched, error },
    type,
    ...rest
  } = props;

  const id = `${input.name}-field`;

  const onBlur =
    type === 'number'
      ? e => input.onBlur(Number(e.target.value))
      : input.onBlur;

  return (
    <InputField id={id} {...props}>
      <InputStyled
        disabled={Boolean(disabled)}
        {...input}
        {...rest}
        onBlur={onBlur}
        id={id}
        type={type}
        className={touched && error ? 'error' : null}
      />
    </InputField>
  );
};

export default TextField;
