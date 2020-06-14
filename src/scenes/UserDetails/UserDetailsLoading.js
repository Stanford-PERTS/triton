import React from 'react';
import Card from 'components/Card';
import Loading from 'components/Loading';

export default () => (
  <Card>
    <Card.Header>User Details</Card.Header>
    <Card.Content>
      <Loading />
    </Card.Content>
  </Card>
);
