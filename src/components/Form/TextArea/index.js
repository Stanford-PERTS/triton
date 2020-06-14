import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import InputField from 'components/Form/InputField';

const TextareaStyled = styled.textarea`
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

const TextArea = props => {
  const {
    disabled,
    input,
    label,
    type,
    required,
    meta: { touched, error },
    ...rest
  } = props;

  const id = `${input.name}-field`;

  return (
    <InputField id={id} {...props}>
      <TextareaStyled
        disabled={Boolean(disabled)}
        {...input}
        {...rest}
        id={id}
        className={touched && error ? 'error' : null}
        rows="5"
      />
    </InputField>
  );
};

export default TextArea;
