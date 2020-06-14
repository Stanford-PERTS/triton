import React from 'react';
import { compose } from 'recompose';
import { withMonoContext, RenderChildrenWithContext } from 'programs/contexts';

import TaskInputCycleDateRange from 'programs/TaskInputCycleDateRange';

class TaskScheduleCycleDates extends React.Component {
  render() {
    const { cycles, numToSchedule: n = 3 } = this.props;

    return cycles.slice(0, n).map((cycle, i) => (
      <div key={i}>
        <h3>Cycle {cycle.ordinal}</h3>
        <RenderChildrenWithContext cycle={cycle}>
          <TaskInputCycleDateRange form={`cycleDateRange${i}`} label="" />
        </RenderChildrenWithContext>
      </div>
    ));
  }
}

export default compose(withMonoContext)(TaskScheduleCycleDates);
