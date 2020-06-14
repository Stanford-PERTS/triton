import React from 'react';
import * as routes from 'routes';
import pluralize from 'pluralize';

import Card from 'components/Card';
import CardContentTitle from 'components/Card/CardContentTitle';
import RelationCounts from 'components/RelationCounts';
import { MenuConfigItem } from 'components/Card/CardMenu';
import { OrganizationEntity } from 'services/triton/organizations';

const menuConfig = (org: OrganizationEntity): MenuConfigItem[] => [
  {
    text: 'Settings',
    icon: 'gear',
    to: routes.toOrganizationDetails(org.uid),
  },
  {
    text: 'Teams',
    icon: 'users',
    to: routes.toOrganizationTeams(org.uid),
  },
  {
    text: 'Classes',
    icon: 'graduation-cap',
    to: routes.toOrganizationClassrooms(org.uid),
  },
  {
    text: 'Administrators',
    icon: 'users',
    to: routes.toOrganizationUsers(org.uid),
  },
];

const SearchRowTeam = ({ entity: org }: { entity: OrganizationEntity }) => (
  <Card.Row
    checkboxName={org.uid}
    key={org.uid}
    menuConfig={menuConfig(org)}
    to={routes.toOrganizationDetails(org.uid)}
  >
    <CardContentTitle>{org.name}</CardContentTitle>
    <RelationCounts>{pluralize('team', org.num_teams, true)}</RelationCounts>
  </Card.Row>
);

export default SearchRowTeam;
