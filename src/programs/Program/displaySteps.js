import React from 'react';
import * as routes from 'routes';

/**
 * Create a "display step" which is a POJO representing steps as they are
 * routed and displayed, not as they are stored or configured.
 * @param  {string} parentLabel either single step label or cycle id
 * @param  {string} type     'single' or 'cycle'
 * @return {Object}          display step POJO
 */
export const newDisplayStep = (parentLabel, type) => ({ parentLabel, type });

/**
 * Derive the Step components based on configured steps and store cycles. Drives
 * routing, navigation, linking, etc.
 * @param  {Array} steps   of Components from config
 * @param  {Array} cycles  of cycle objects from store
 * @return {Array}         of Step components
 */
export function getDisplaySteps(steps, cycles) {
  const displaySteps = steps.reduce((ds, step) => {
    if (step.props.type === 'single') {
      ds.push(
        React.cloneElement(step, {
          parentLabel: step.props.label,
          key: step.props.label,
        }),
      );
      return ds;
    }

    if (step.props.type === 'cycle') {
      cycles.forEach(cycle => {
        // By default, cycle steps will be named 'Cycle 1', 'Cycle 2', etc. but
        // you can override this by providing an array of cycles names to the
        // <Step type="cycle" name={['Override Name 1', 'Override Name 2']}>
        // component.
        const stepName =
          (step.props.name && step.props.name[cycle.ordinal - 1]) ||
          `Cycle ${cycle.ordinal}`;

        ds.push(
          React.cloneElement(step, {
            parentLabel: cycle.uid,
            key: cycle.uid,
            name: stepName,
          }),
        );
      });
      return ds;
    }

    return ds;
  }, []);

  return displaySteps;
}

/**
 * Choses either the first incomplete display step or, if they are all
 * complete, the last one.
 *
 * @param  {Array}  responses     from store
 * @param  {Array}  displaySteps  Step components
 * @return {Object}               Step component
 */
export const defaultDisplayStep = (responses, displaySteps) => {
  const firstIncomplete = displaySteps.find(
    step =>
      !responses.some(
        r =>
          r.type === 'Team' &&
          r.progress === 100 &&
          r.parent_id === step.props.parentLabel &&
          r.module_label === 'StepComplete',
      ),
  );

  return firstIncomplete || displaySteps[displaySteps.length - 1];
};

export const displayStepRoute = (teamId, displayStep) =>
  routes.toProgramStep(
    teamId,
    displayStep.props.type,
    displayStep.props.parentLabel,
  );
