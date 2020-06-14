import React from 'react';

import Card from 'components/Card';
import TaskCaptainOnlyStyled from './TaskCaptainOnly';
import TaskIconComplete from './TaskIconComplete';

const TaskLink = ({ children, task }) => (
  <Card>
    <Card.Header
      task
      left={task.mayEdit && <TaskIconComplete />}
      right={<TaskCaptainOnlyStyled />}
    >
      {task.title}
    </Card.Header>
    {children && <Card.Content>{children}</Card.Content>}
    <Card.Content to={task.to} externalLink={task.externalLink}>
      {task.linkText || 'Click here to complete this task.'}
    </Card.Content>
  </Card>
);

export default TaskLink;
