import React from 'react';
import * as routes from 'routes';
import pluralize from 'pluralize';

import Card from 'components/Card';
import CardContentTitle from 'components/Card/CardContentTitle';
import RelationCounts from 'components/RelationCounts';
import { MenuConfigItem } from 'components/Card/CardMenu';
import { TeamEntity } from 'services/triton/teams';

const menuConfig = (team: TeamEntity): MenuConfigItem[] => [
  {
    text: 'Settings',
    icon: 'gear',
    to: routes.toTeamDetails(team.uid),
  },
  {
    text: 'Classes',
    icon: 'graduation-cap',
    to: routes.toTeamClassrooms(team.uid),
  },
  {
    text: 'Reports',
    icon: 'line-chart',
    to: routes.toTeamReports(team.uid),
  },
  {
    text: 'Documents',
    icon: 'file-text-o',
    to: routes.toTeamDocuments(team.uid),
  },
  {
    text: 'Stages',
    icon: 'list-ol',
    to: routes.toProgramSteps(team.uid),
  },
];

const SearchRowTeam = ({ entity: team }: { entity: TeamEntity }) => (
  <Card.Row
    checkboxName={team.uid}
    key={team.uid}
    menuConfig={menuConfig(team)}
    to={routes.toTeam(team.uid)}
  >
    <CardContentTitle>{team.name}</CardContentTitle>
    <RelationCounts>
      {pluralize('teacher', team.num_users, true)};{' '}
      {pluralize('class', team.num_classrooms, true)}
    </RelationCounts>
  </Card.Row>
);

export default SearchRowTeam;
