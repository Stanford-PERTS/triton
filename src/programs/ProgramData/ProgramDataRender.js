import React from 'react';
import { RenderChildrenWithContext } from 'programs/contexts';

const ProgramDataRender = ({
  program,
  team,
  classrooms,
  cycles,
  responses,
  children,
}) => (
  <RenderChildrenWithContext
    program={program}
    team={team}
    classrooms={classrooms}
    cycles={cycles}
    responses={responses}
  >
    {children}
  </RenderChildrenWithContext>
);

export default ProgramDataRender;
