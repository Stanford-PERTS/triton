import React from 'react';
import { defaultDisplayStep, getDisplaySteps } from './displaySteps';

const Step = props => null;
const singleStep = label => ({ label, type: 'single' });
const cycleStep = () => ({ type: 'cycle' });

describe('defaultDisplayStep', () => {
  const cycles = [{ uid: 'Cycle_001' }, { uid: 'Cycle_002' }];

  it('chooses first if no completes, single first', () => {
    const responses = [];
    const steps = getDisplaySteps(
      [
        <Step {...singleStep('first')} />,
        <Step {...singleStep('second')} />,
        <Step {...cycleStep()} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });

  it('chooses first if no completes, cycle first', () => {
    const responses = [];
    const steps = getDisplaySteps(
      [
        <Step {...cycleStep()} />,
        <Step {...singleStep('first')} />,
        <Step {...singleStep('second')} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });

  it('skips over completes', () => {
    const responses = [
      {
        type: 'Team',
        parent_id: 'first',
        module_label: 'StepComplete',
        progress: 100,
      },
    ];
    const steps = getDisplaySteps(
      [
        <Step {...singleStep('first')} />,
        <Step {...singleStep('second')} />,
        <Step {...cycleStep()} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [, expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });

  it('chooses <100 similar to no response', () => {
    const responses = [
      {
        type: 'Team',
        parent_id: 'first',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'second',
        module_label: 'StepComplete',
        progress: 50,
      },
    ];
    const steps = getDisplaySteps(
      [
        <Step {...singleStep('first')} />,
        <Step {...singleStep('second')} />,
        <Step {...cycleStep()} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [, expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });

  it('chooses mid-cycle steps', () => {
    const responses = [
      {
        type: 'Team',
        parent_id: 'first',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'Cycle_001',
        module_label: 'StepComplete',
        progress: 100,
      },
    ];
    const steps = getDisplaySteps(
      [
        <Step {...singleStep('first')} />,
        <Step {...cycleStep()} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [, , expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });

  it('chooses post-cycle steps', () => {
    const responses = [
      {
        type: 'Team',
        parent_id: 'first',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'Cycle_001',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'Cycle_002',
        module_label: 'StepComplete',
        progress: 100,
      },
    ];
    const steps = getDisplaySteps(
      [
        <Step {...singleStep('first')} />,
        <Step {...cycleStep()} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [, , , expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });

  it('handles all steps complete', () => {
    const responses = [
      {
        type: 'Team',
        parent_id: 'first',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'Cycle_001',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'Cycle_002',
        module_label: 'StepComplete',
        progress: 100,
      },
      {
        type: 'Team',
        parent_id: 'last',
        module_label: 'StepComplete',
        progress: 100,
      },
    ];
    const steps = getDisplaySteps(
      [
        <Step {...singleStep('first')} />,
        <Step {...cycleStep()} />,
        <Step {...singleStep('last')} />,
      ],
      cycles,
    );

    const [, , , expected] = steps;

    expect(defaultDisplayStep(responses, steps)).toEqual(expected);
  });
});
