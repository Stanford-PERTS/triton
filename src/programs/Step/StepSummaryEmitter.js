import React from 'react';
import { compose, setDisplayName } from 'recompose';
import { withCycleContext } from 'programs/contexts';

const StepSummaryEmitter = props => {
  const { children, cycle } = props;

  const childrenArr = React.Children.toArray(children);

  // Note: We are filtering out non-reportable and tasks that shouldn't be
  // displayed based on showInCycle here. This will prevent these tasks from
  // entering the `dashbord` slice of our store to keep them out of our search
  // and filter.

  // Filter tasks tagged with `reportable` in config file.
  let tasks = childrenArr.filter(t => t.props.reportable);

  // Filter tasks with showInCycle matching current cycle.
  tasks = tasks.filter(t => {
    if (t.props.showInCycle) {
      return parseInt(t.props.showInCycle, 10) === cycle.ordinal;
    }

    return true;
  });

  return tasks;
};

export default compose(
  withCycleContext,
  setDisplayName('StepSummaryEmitter'),
)(StepSummaryEmitter);
