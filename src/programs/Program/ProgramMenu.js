import React from 'react';
import { withMonoContext } from 'programs/contexts';
import { getDisplaySteps } from 'programs/Program/displaySteps';
import ProgramMenuAddCycles from './ProgramMenuAddCycles';

const ProgramMenu = ({ children, cycles }) => {
  const displaySteps = getDisplaySteps(children, cycles);
  let insertedMenuItem = false;

  // Add "Add Cycle" menu item after the last cycle Step component
  const displayStepsWithAddCycle = displaySteps.reduce((steps, thisStep) => {
    const lastStep = steps[steps.length - 1];
    const lastStepType = lastStep && lastStep.props && lastStep.props.type;

    if (lastStepType === 'cycle' && thisStep.props.type !== 'cycle') {
      steps.push(<ProgramMenuAddCycles key="addCycle" />);
      insertedMenuItem = true;
    }

    steps.push(thisStep);

    return steps;
  }, []);

  // The above reduce assumes there are 'single' Steps after 'cycle' Steps. If
  // not, then tack on the "Add Cycle" menu item here.
  if (!insertedMenuItem) {
    displayStepsWithAddCycle.push(<ProgramMenuAddCycles key="addCycle" />);
  }

  return displayStepsWithAddCycle;
};

export default withMonoContext(ProgramMenu);
