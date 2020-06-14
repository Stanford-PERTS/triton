import React from 'react';
import { Progress } from 'antd';
import styled, { css } from 'styled-components';
import theme from 'components/theme';

export const TeamResponsesRow = styled.tr`
  :nth-child(even) {
    background: ${theme.palette.lightGray};
  }
`;

export const TeamResponsesCol = styled.td`
  padding: 8px;

  &:not(:last-child) {
    padding-right: 20px;
  }

  ${props =>
    props.className === 'info' &&
    css`
      white-space: nowrap;
    `};

  ${props =>
    props.className === 'progress' &&
    css`
      width: 100%;
    `};
`;

const TeamResponses = ({ teamUsers, teamResponses }) => (
  <div className="TeamResponses">
    <table>
      <tbody>
        {teamUsers.map(user => {
          const response = teamResponses.find(r => r.user_id === user.uid) || {
            progress: 0,
          };

          return (
            <TeamResponsesRow key={user.uid}>
              <TeamResponsesCol className="info">
                {user.name || user.email}
              </TeamResponsesCol>
              <TeamResponsesCol className="info">
                {response.progress}%
              </TeamResponsesCol>
              <TeamResponsesCol className="progress">
                <Progress percent={response.progress} showInfo={false} />
              </TeamResponsesCol>
            </TeamResponsesRow>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default TeamResponses;
