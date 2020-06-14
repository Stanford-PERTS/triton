import React from 'react';
import styled, { css } from 'styled-components';
import { Field } from 'redux-form';

import CardContentLink from './CardContentLink';
import CardContentText from './CardContentText';
import CardMenu, { MenuConfigItem } from './CardMenu';

interface CardRowProps {
  // Form field name for the select checkbox.
  checkboxName: string;

  // Disable interactions
  disabled?: boolean;

  // If present, displays a menu on the right.
  menuConfig?: MenuConfigItem[];
  to: string;
}

export default class CardRow extends React.Component<CardRowProps> {
  render() {
    const { checkboxName, children, menuConfig, to } = this.props;

    return (
      <CardRowStyled>
        <Field component="input" name={checkboxName} type="checkbox" />
        <CardContentLink to={to} rounded>
          <CardContentText>{children}</CardContentText>
        </CardContentLink>
        {menuConfig && <CardMenu menuConfig={menuConfig} />}
      </CardRowStyled>
    );
  }
}

interface CardRowStyledProps {
  disabled?: boolean;
}

export const CardRowStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 40px;
  max-width: 100%;

  table {
    width: 100%;
  }

  > :not(:last-child) {
    margin-right: 20px;
  }

  a {
    border-top: none;
  }

  ${(props: CardRowStyledProps) =>
    props.disabled &&
    css`
      pointer-events: none;
    `};
`;
