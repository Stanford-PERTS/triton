import React from 'react';
import styled from 'styled-components';
import { Progress } from 'antd';
import { withAllContexts } from 'programs/contexts';
import get from 'lodash/get';

import theme from 'components/theme';

const TaskContainer = styled.div`
  margin-bottom: ${theme.units.paragraphSpacing};

  .ant-progress-inner {
    background-color: #e4e4e4;
  }
`;

const TaskLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const TaskProgressContainer = styled.div`
  display: flex;

  > :not(:last-child) {
    margin-right: 8px;
  }
`;

const TaskProgressBar = ({
  label,
  path,
  program,
  team,
  completeThreshold,
  cycles,
  cycle,
  responses,
  response,
  step,
}) => {
  // This component works similar to the programs/Data component. It uses
  // Lodash's get function to `path` our way to the piece of data we want.
  const value = get(
    {
      program,
      team,
      cycles,
      cycle,
      responses,
      response,
      step,
    },
    path,
  );

  const percent = value === undefined ? 0 : value;
  const status = percent >= completeThreshold ? 'success' : 'active';

  return (
    <TaskContainer>
      <TaskLabel>{label}</TaskLabel>
      <TaskProgressContainer>
        <div>0%</div>
        <Progress percent={percent} status={status} showInfo={false} />
        <div>100%</div>
      </TaskProgressContainer>
    </TaskContainer>
  );
};

export default withAllContexts(TaskProgressBar);
