// FormGroupRow component can be used when you'd like to place multiple input
// fields and buttons on the same line.
//
// <FormGroupRow>
//   <Field component={FieldDatePicker} />
//   <Button>Save</Button>
// </FormGroupRow>

import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import Button from 'components/Button';

const FormGroupRowStyles = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: row;

  @media (max-width: 600px) {
    flex-direction: column;
  }

  margin-bottom: ${theme.units.paragraphSpacing};

  .FieldPicker .ant-calendar-picker {
    /* Override so antd calendar pickers align with other elements */
    margin-bottom: 0;
  }

  > :not(:last-child) {
    margin-right: 8px;
  }

  ${Button} {
    /* Limit width to contents */
    width: auto;
    /* Match antd input field height */
    height: 30px;
  }
`;

const FormGroupRowItem = styled.div`
  /* Match antd input field margin-bottom */
  margin-bottom: 8px;
  flex-grow: 1;
`;

const FormGroupRow = ({ children }) => (
  <FormGroupRowStyles>
    {React.Children.map(children, child => (
      <FormGroupRowItem>{child}</FormGroupRowItem>
    ))}
  </FormGroupRowStyles>
);

FormGroupRow.displayName = 'FormGroupRow';
export default FormGroupRow;
