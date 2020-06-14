import React from 'react';
import Card from 'components/Card';

const SectionItem = props => {
  const { children, ...rest } = props;

  return <Card.Content {...rest}>{children}</Card.Content>;
};

export default SectionItem;
