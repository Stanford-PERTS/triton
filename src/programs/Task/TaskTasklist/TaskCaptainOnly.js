import React, { useContext } from 'react';
import styled from 'styled-components';

import TermsContext from 'components/TermsContext';
import theme from 'components/theme';
import { withTaskContext } from 'programs/contexts';

import iconTeamCaptain from 'components/ApplicationSidebar/iconTeamCaptain.png';

const TaskCaptainOnly = ({ task }) => {
  const terms = useContext(TermsContext);
  return task.captainResponsible ||
    task.captainOnlyVisible ||
    task.captainOnlyEditable ? (
    <TaskCaptainOnlyStyled>
      <CaptainImage>
        <img src={iconTeamCaptain} alt="" />
      </CaptainImage>
      <CaptainTextWrapper>
        <CaptainText>{terms.captain}</CaptainText>
      </CaptainTextWrapper>
    </TaskCaptainOnlyStyled>
  ) : null;
};

export default withTaskContext(TaskCaptainOnly);

const CaptainImage = styled.div`
  z-index: ${theme.zIndex.captainOnlyImage};

  display: flex;
  align-items: center;
  justify-content: center;

  height: 38px;
  width: 38px;
  /* Color match somewhere within the captain img. */
  border: 1px solid #efeff1;
  border-radius: 50%;

  background: ${theme.palette.secondary};

  img {
    width: 30px;
  }
`;

const CaptainText = styled.div`
  position: relative;

  padding: 0 36px 0 10px;

  border-radius: ${theme.units.borderRadius};

  background: ${theme.palette.secondary};
  /* Color match somewhere within the captain img. */
  color: #efeff1;

  font-weight: normal;
  white-space: nowrap;
`;

const CaptainTextWrapper = styled.div`
  position: absolute;
  top: 9px;
  right: 10px;
  z-index: ${theme.zIndex.captainOnlyText};

  overflow: hidden;
`;

const TaskCaptainOnlyStyled = styled.div`
  position: relative;
  top: 0;
  right: -30px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-transform: none;

  &:hover {
    ${CaptainText} {
      right: 0;
      transition: 1s;
    }
  }
`;
