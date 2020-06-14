import React from 'react';
import * as routes from 'routes';
import pluralize from 'pluralize';

import Card from 'components/Card';
import CardContentTitle from 'components/Card/CardContentTitle';
import RelationCounts from 'components/RelationCounts';
import { ClassroomEntity } from 'services/triton/classrooms';
import { MenuConfigItem } from 'components/Card/CardMenu';

const menuConfig = (cls: ClassroomEntity): MenuConfigItem[] => [
  {
    text: 'Settings',
    icon: 'gear',
    to: routes.toTeamClassroom(cls.team_id, cls.uid),
  },
  {
    text: 'Roster',
    icon: 'users',
    to: routes.toTeamClassroomRoster(cls.team_id, cls.uid),
  },
  {
    text: 'Team Classes',
    icon: 'list-ul',
    to: routes.toTeamClassrooms(cls.team_id),
  },
  {
    text: 'Team Reports',
    icon: 'file-text-o',
    to: routes.toTeamReports(cls.team_id),
  },
];

const SearchRowClassroom = ({ entity: cls }: { entity: ClassroomEntity }) => (
  <Card.Row
    checkboxName={cls.uid}
    key={cls.uid}
    menuConfig={menuConfig(cls)}
    to={routes.toTeamClassroom(cls.team_id, cls.uid)}
  >
    <CardContentTitle>{cls.name}</CardContentTitle>
    <RelationCounts>
      {pluralize('student', cls.num_students, true)}
    </RelationCounts>
  </Card.Row>
);

export default SearchRowClassroom;
