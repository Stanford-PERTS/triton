import React, { useContext } from 'react';
import * as routes from 'routes';
import fromParams from 'utils/fromParams';

import BackButton from 'components/BackButton';
import Section from 'components/Section';
import TeamUsersLeave from './TeamUsersLeave';
import TermsContext from 'components/TermsContext';

const TeamUsersWrapper = props => {
  const { teamId, stepType, parentLabel } = fromParams(props);
  const { children, handleLeaveTeam, program = {}, users } = props;
  const terms = useContext(TermsContext);

  // The existance of a parentLabel indicate that this scene is being displayed
  // from within a program tasklist. In that case, we want to display a back
  // navigation button to allow the user to easily return.
  const LeftNavigation = parentLabel
    ? () => (
        <BackButton to={routes.toProgramStep(teamId, stepType, parentLabel)} />
      )
    : () => <BackButton to={routes.toTeamDetails(teamId)} />;

  const numUsersOnTeam = users.length;
  const isMaxUsers = numUsersOnTeam >= program.max_team_members;

  const toRoute = isMaxUsers
    ? null
    : parentLabel
    ? routes.toProgramTeamUserInvite(teamId, stepType, parentLabel)
    : routes.toTeamUsersInvite(teamId);

  return (
    <>
      <Section
        dark
        left={<LeftNavigation />}
        title={`${terms.team} Members`}
        to={toRoute}
      >
        {children}
      </Section>

      <TeamUsersLeave handleLeaveTeam={handleLeaveTeam} />
    </>
  );
};

export default TeamUsersWrapper;
