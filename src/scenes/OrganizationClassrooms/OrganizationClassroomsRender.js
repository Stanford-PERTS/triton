import React from 'react';

import TeamClassrooms from 'scenes/TeamClassrooms';

const OrganizationClassroomsRender = ({ teams }) => (
  <div className="OrganizationTeam">
    {teams.map(team => (
      <TeamClassrooms key={team.uid} teamId={team.uid} teamName={team.name} />
    ))}
  </div>
);

export default OrganizationClassroomsRender;
