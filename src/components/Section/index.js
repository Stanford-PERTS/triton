// Section wraps Card & Card.Header to provide backward compatibility for other
// components & scenes that are using the old Section / SectionItem components.

import React from 'react';

import Card from 'components/Card';
import AddButton from 'components/AddButton';

const Section = props => {
  const {
    children,
    danger,
    dark,
    disabled,
    left,
    right,
    title,
    to,
    type,
  } = props;

  // Allow for legacy `to` use
  const rightComponent = to ? <AddButton to={to} /> : right;

  // We will theme the Section dark for SceneTitles.
  // You can also pass in `dark` to force the Section dark.
  const styleDark = dark || type === 'scene';

  return (
    <Card disabled={disabled}>
      <Card.Header
        danger={danger}
        dark={styleDark}
        left={left}
        right={rightComponent}
        type={type}
      >
        {title}
      </Card.Header>
      {children}
    </Card>
  );
};

export default Section;
