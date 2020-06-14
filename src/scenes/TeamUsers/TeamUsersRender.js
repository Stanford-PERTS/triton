import React, { useContext } from 'react';
import styled from 'styled-components';

import UserMenu from 'scenes/TeamFormBase/UserMenu';
import GetStarted from 'components/GetStarted';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const UserLabel = styled.span`
  margin-left: 20px;
  font-style: italic;
`;

const FloatRight = styled.div`
  float: right;
`;

const TeamUsersRender = ({
  hasCaptainPermission,
  team,
  users,
  disabled,
  handlePromoteUser,
  handleRemoveUser,
  handleResendInvitation,
  handleLeaveTeam,
}) => {
  const terms = useContext(TermsContext);
  return (
    <>
      {users.length === 1 && (
        <SectionItem>
          <GetStarted>
            <p>
              <strong>You&rsquo;re the only one here.</strong>
            </p>
            <p>Invite colleagues if you&rsquo;d like to collaborate.</p>
          </GetStarted>
        </SectionItem>
      )}

      {users.map(user => {
        const userIsCaptain = team.captain_id === user.uid;

        return (
          <SectionItem data-test="team-user" key={user.uid}>
            <span>
              {user.name} {user.email && `\xa0(${user.email})`}
            </span>

            {userIsCaptain && <UserLabel>{terms.captain}</UserLabel>}
            {!user.verified && <UserLabel>Invitation Pending</UserLabel>}

            <FloatRight>
              <UserMenu
                hasCaptainPermission={hasCaptainPermission}
                user={user}
                userIsCaptain={userIsCaptain}
                userIsVerified={user.verified}
                disabled={disabled}
                handlePromoteUser={handlePromoteUser}
                handleRemoveUser={handleRemoveUser}
                handleResendInvitation={handleResendInvitation}
              />
            </FloatRight>
          </SectionItem>
        );
      })}
    </>
  );
};

export default TeamUsersRender;
