import React from 'react';
import * as routes from 'routes';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import fromParams from 'utils/fromParams';

import Card from 'components/Card';
import CardContentTitle from 'components/Card/CardContentTitle';
import RelationCounts from 'components/RelationCounts';
import { MenuConfigItem } from 'components/Card/CardMenu';
import { UserEntity } from 'services/triton/users';

const menuConfig = (user: UserEntity): MenuConfigItem[] => [
  {
    text: 'Settings',
    icon: 'gear',
    to: routes.toUserDetails(user.uid),
  },
];

interface Props extends RouteComponentProps {
  entity: UserEntity;
}

const SearchRowUser = ({ entity: user, ...routeProps }: Props) => (
  <Card.Row
    checkboxName={user.uid}
    key={user.uid}
    menuConfig={menuConfig(user)}
    to={routes.toProgramSearch(
      fromParams(routeProps).programLabel,
      `user:${user.email}`,
    )}
  >
    <CardContentTitle>{user.name}</CardContentTitle>
    <RelationCounts>{user.email}</RelationCounts>
  </Card.Row>
);

export default withRouter(SearchRowUser);
