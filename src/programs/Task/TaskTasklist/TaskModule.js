import React from 'react';
import * as routes from 'routes';

import CompletionTracking from 'programs/CompletionTracking';
import TaskCaptainOnlyStyled from './TaskCaptainOnly';
import Card from 'components/Card';
import IconComplete from 'components/IconComplete';

export const ModuleLink = props => {
  const { children, cycle, step, task, team } = props;
  const parentLabel = step.type === 'cycle' ? cycle.uid : step.label;
  const to = routes.toProgramModule(
    team.uid,
    step.type,
    parentLabel,
    task.label,
  );

  return <Card.Content to={to}>{children}</Card.Content>;
};

class TaskModule extends React.Component {
  render() {
    const { children, response, task } = this.props;
    const progress = (response && response.progress) || 0;
    const complete = progress === 100;

    const showCompletionTracking =
      task.showCompletionTracking &&
      !task.captainOnlyEditable &&
      !task.captainOnlyVisible;
    const showLink = task.hasCaptainPermission || !task.captainOnlyEditable;

    // Users who can't complete the module shouldn't be bothered about the
    // state of the checkbox. Just don't show it at all.
    const left = showLink ? <IconComplete complete={complete} /> : null;

    return (
      <Card>
        <Card.Header task left={left} right={<TaskCaptainOnlyStyled />}>
          {task.title}
        </Card.Header>
        {React.Children.map(children, child =>
          child.props
            ? React.cloneElement(child, this.props, child.props.children)
            : child,
        )}
        {showCompletionTracking && <CompletionTracking task={task} />}
      </Card>
    );
  }
}

export default TaskModule;
