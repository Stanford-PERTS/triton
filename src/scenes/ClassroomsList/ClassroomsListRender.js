import React from 'react';

import Card from 'components/Card';
import ClassroomsListRenderItem from './ClassroomsListRenderItem';
import InfoBox from 'components/InfoBox';

const ClassroomsListRender = ({
  activeCycle,
  classrooms,
  participationByClassroomId,
  parentLabel,
  stepType,
  teamId,
}) => (
  <div className="ClassroomsListRender">
    {!activeCycle && (
      <Card.Content>
        <InfoBox>
          There is no currently active cycle, so participation is not displayed.
        </InfoBox>
      </Card.Content>
    )}
    {classrooms.map(classroom => (
      <ClassroomsListRenderItem
        activeCycle={activeCycle}
        key={classroom.uid}
        classroom={classroom}
        classroomId={classroom.uid}
        parentLabel={parentLabel}
        stepType={stepType}
        teamId={teamId}
      />
    ))}
  </div>
);

export default ClassroomsListRender;
