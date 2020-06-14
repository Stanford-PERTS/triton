// TaskIconComplete handles the determining of whether to display an
// <IconComplete /> for the task and whether that <IconComplete /> will be set
// to complete true or false.
//
// This is utilized by our `type="inline"` tasks.
//
// Inline tasks can be setup two ways, hooking into cycle data or selectors
// results. See the following examples:
//
// <Task
//   type="inline"
//   completeByCycleData="start_date"
// />
//
// <Task
//   type="inline"
//   completeBySelector="team.cycles.selected"
// />
//
// By providing one of the `completeBy*` props, you indicate that you would like
// to display an <IconComplete /> (unchecked/checked). See mapStateToProps for
// the source of each of those props' Boolean checks.

import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withAllContexts, withDisplayContext } from 'programs/contexts';
import selectors from 'state/selectors';
import get from 'lodash/get';

import IconComplete from 'components/IconComplete';

class TaskIconComplete extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.complete !== nextProps.complete;
  }

  render() {
    const { complete } = this.props;
    return complete === undefined ? null : <IconComplete complete={complete} />;
  }
}

export const isTaskComplete = (state, props) => {
  const { cycle, task, response } = props;

  // Provide warning to developers in the case where the completeBySelector
  // prop provided does not match any existing selector.
  if (
    task.completeBySelector &&
    get(selectors, task.completeBySelector) === undefined
  ) {
    console.warn(
      `Task: The selector provided to '${task.title}' does not exist.`,
    );
  }

  const isCompleteCycleData = Boolean(cycle[task.completeByCycleData]);
  const isCompleteSelector = Boolean(
    get(selectors, task.completeBySelector, () => false)(state, props),
  );

  let complete = undefined;

  if (task.completeByCycleData || task.completeBySelector) {
    complete = isCompleteCycleData || isCompleteSelector;
  }

  if (task.type === 'module' || task.type === 'buttonModule') {
    const progress = (response && response.progress) || 0;
    complete = progress === 100;
  }

  return complete;
};

const mapStateToProps = (state, props) => {
  const complete = isTaskComplete(state, props);

  return { complete };
};

export default compose(
  withRouter,
  withDisplayContext,
  withAllContexts,
  connect(mapStateToProps),
)(TaskIconComplete);
