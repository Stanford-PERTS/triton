import React from 'react';
import { compose } from 'recompose';
import { withAllContexts } from 'programs/contexts';

import TaskInline from './TaskInline';
import TaskInlineModule from './TaskInlineModule';
import TaskLink from './TaskLink';
import TaskModule from './TaskModule';
import TaskButtonModule from './TaskButtonModule';

const TaskComponents = {
  inline: TaskInline,
  inlineModule: TaskInlineModule,
  link: TaskLink,
  module: TaskModule,
  buttonModule: TaskButtonModule,
  default: () => <></>,
};

const TaskTasklist = props => {
  const { task } = props;
  let ComponentToRender;
  if (typeof task.type === 'string') {
    ComponentToRender = TaskComponents[task.type];
  } else if (
    typeof task.type === 'function' ||
    task.type instanceof React.Component
  ) {
    ComponentToRender = task.type;
  } else {
    throw new Error(`Didn't understand task type: ${task.type}`);
  }
  return <ComponentToRender {...props} />;
};

export default compose(withAllContexts)(TaskTasklist);
