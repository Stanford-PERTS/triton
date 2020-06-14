import React from 'react';
import { compose, lifecycle } from 'recompose';
import { withRouter } from 'react-router-dom';
import scrollToTopOnPropChange from 'utils/scrollToTopOnPropChange';

import {
  withCycleContext,
  withMonoContext,
  withStepContext,
} from 'programs/contexts';
import ParticipationData from './ParticipationData';
import Task from 'programs/Task';
import TaskCycleCreateAndAdvance from 'programs/Task/TaskTasklist/TaskCycleCreateAndAdvance';
import TaskInputDeleteCycle from 'programs/TaskInputDeleteCycle';
import Show from 'components/Show';
import StepNavBar from './StepNavBar';

export const CycleStepCompleteTask = () => (
  <Task
    buttonText={<span>I&rsquo;m done with this for now!</span>}
    captainOnlyVisible
    label="StepComplete"
    responseType="Team"
    title="Start Next Cycle"
    type={TaskCycleCreateAndAdvance}
  />
);

export const StepCompleteTask = () => (
  <Task
    type="buttonModule"
    responseType="Team"
    captainOnlyVisible
    label="StepComplete"
    title="Complete This Stage"
    buttonText="Mark Complete"
  />
);

const StepTasklist = props => {
  const {
    children,
    cycle,
    cycles,
    hideStepComplete,
    program,
    step,
    toNext,
    toPrevious,
  } = props;

  const isCycle = step.type === 'cycle';
  const atMaxCycles = isCycle && cycle.ordinal === program.max_cycles;
  const promptNextCycle = isCycle && !atMaxCycles;

  return (
    <>
      <ParticipationData />
      <StepNavBar title={step.name} toPrevious={toPrevious} toNext={toNext} />
      {children}
      <Show when={!hideStepComplete && !promptNextCycle}>
        {/* applies to type="single" and when you can't add more cycles */}
        <StepCompleteTask />
      </Show>
      <Show when={!hideStepComplete && promptNextCycle}>
        {/* applies when you may add more cycles */}
        <CycleStepCompleteTask />
      </Show>
      <StepNavBar title={step.name} toPrevious={toPrevious} toNext={toNext} />

      <Show when={step.type === 'cycle' && cycles.length > program.min_cycles}>
        <Task type="inline" title="Delete This Cycle" captainOnlyVisible danger>
          <TaskInputDeleteCycle />
        </Task>
      </Show>
    </>
  );
};

export default compose(
  withRouter,
  withMonoContext,
  withCycleContext,
  withStepContext,
  lifecycle({
    componentDidUpdate(prevProps) {
      // doParticipationQuery(this.props, prevProps);
      scrollToTopOnPropChange(['parentLabel'], prevProps, this.props);
    },
    componentDidMount() {
      // doParticipationQuery(this.props, null);

      // also needed on mount because we might be coming from single step
      // to a cycle step (or the reverse) and so componentDidUpdate won't
      // be called in that case
      scrollToTopOnPropChange(['parentLabel'], null, this.props);
    },
  }),
)(StepTasklist);
