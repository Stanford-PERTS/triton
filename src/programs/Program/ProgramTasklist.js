import React from 'react';
import { compose, defaultProps, setDisplayName } from 'recompose';
import { withRouter, Redirect, Route } from 'react-router-dom';

import fromParams from 'utils/fromParams';
import * as routes from 'routes';
import { withMonoContext } from 'programs/contexts';
import {
  defaultDisplayStep,
  displayStepRoute,
  getDisplaySteps,
} from 'programs/Program/displaySteps';

const ProgramTasklist = props => {
  const { children, cycles, match, team, responses } = props;

  // Determine the single and cycles steps to display.
  const displaySteps = getDisplaySteps(children, cycles);

  // Redirect to appropriate step.
  if (match.path === routes.toProgramSteps() && match.isExact) {
    // We're at /teams/:teamId/steps, with no params to specify which step to
    // display. Figure out the right one and redirect. If all steps are done
    // choose the last step.
    const ds = defaultDisplayStep(responses, displaySteps);
    return <Redirect to={displayStepRoute(team.uid, ds)} />;
  }

  // Alert the developer that they broke a program config rule.
  const cycleChildren = children.filter(child => child.props.type === 'cycle');
  if (cycleChildren.length > 1) {
    throw new Error('Configuration error, there must be only one cycle step.');
  }

  return (
    <Route
      path={routes.toProgramStep()}
      render={renderProps => {
        const { teamId, parentLabel } = fromParams(renderProps);

        const stepIndex = displaySteps.findIndex(
          s => s.props.parentLabel === parentLabel,
        );

        const step = displaySteps[stepIndex];

        if (!step) {
          // Either a bad request or when a cycle is deleted. Redirecting to
          // toProgramSteps will cause this component to recalculate which step
          // to send the user to.
          return <Redirect to={routes.toProgramSteps(teamId)} />;
        }

        const prevIndex = stepIndex > 0 ? stepIndex - 1 : -1;
        const nextIndex =
          stepIndex < displaySteps.length - 1 ? stepIndex + 1 : -1;

        const toPrevious =
          prevIndex !== -1 &&
          displayStepRoute(team.uid, displaySteps[prevIndex]);
        const toNext =
          nextIndex !== -1 &&
          displayStepRoute(team.uid, displaySteps[nextIndex]);

        return React.cloneElement(step, { toPrevious, toNext });
      }}
    />
  );
};

export default compose(
  withRouter,
  withMonoContext,
  defaultProps({
    cycles: [],
  }),
  setDisplayName('ProgramTasklist'),
)(ProgramTasklist);
