import React from 'react';
import Icon from 'components/Icon';

const TaskProgressIndicator = ({ complete = false }) => (
  <Icon names={complete ? 'check-circle-o' : 'circle-o'} />
);

export default TaskProgressIndicator;
