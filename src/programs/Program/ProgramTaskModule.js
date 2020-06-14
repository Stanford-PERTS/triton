import React from 'react';
import { compose, defaultProps, setDisplayName } from 'recompose';
import { withRouter, Redirect, Route } from 'react-router-dom';

import fromParams from 'utils/fromParams';
import * as routes from 'routes';
import { withMonoContext } from 'programs/contexts';
import { getDisplaySteps } from 'programs/Program/displaySteps';

const ProgramTaskModule = props => {
  const { children, cycles } = props;

  // Determine the single and cycles steps to display.
  const displaySteps = getDisplaySteps(children, cycles);

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

        return React.cloneElement(step);
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
  setDisplayName('ProgramTaskModule'),
)(ProgramTaskModule);
