import React from 'react';

import Card from 'components/Card';
import TaskCaptainOnlyStyled from './TaskCaptainOnly';
import TaskIconComplete from './TaskIconComplete';

const TaskInline = ({ children, task }) => (
  <Card disabled={!task.mayEdit || task.disabled}>
    <Card.Header
      task
      left={task.mayEdit && <TaskIconComplete />}
      right={<TaskCaptainOnlyStyled />}
    >
      {task.title}
    </Card.Header>
    {children &&
      (task.nowrap ? children : <Card.Content>{children}</Card.Content>)}
  </Card>
);

export default TaskInline;
