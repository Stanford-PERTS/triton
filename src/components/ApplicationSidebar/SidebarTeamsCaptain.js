import React, { useContext } from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import TermsContext from 'components/TermsContext';

import iconTeamCaptain from './iconTeamCaptain.png';

const TeamCaptainBadge = styled.div`
  width: 112px;
  margin: 40px auto 0 auto;

  text-align: center;
  text-transform: uppercase;
  color: ${theme.palette.white};

  display: flex;
  flex-direction: column;
  align-items: center;

  div:first-child {
    background: ${theme.palette.secondaryLight};
    height: 60px;
    width: 60px;
    border-radius: 50%;

    margin-bottom: 10px;

    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SidebarTeamsCaptain = ({ isCaptain, isSupervisor }) => {
  const terms = useContext(TermsContext);

  let badgeMessage;
  if (isSupervisor) {
    badgeMessage = <span>You are an Administrator</span>;
  } else if (isCaptain && terms.captain) {
    badgeMessage = <span>You are the {terms.captain}</span>;
  }

  return badgeMessage ? (
    <TeamCaptainBadge>
      <div>
        <img src={iconTeamCaptain} alt="officer cap" />
      </div>
      <div>{badgeMessage}</div>
    </TeamCaptainBadge>
  ) : null;
};

export default SidebarTeamsCaptain;
