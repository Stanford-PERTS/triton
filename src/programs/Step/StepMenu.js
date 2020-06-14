import React from 'react';
import { compose, defaultProps, setDisplayName } from 'recompose';

import * as routes from 'routes';
import { withMonoContext, withStepContext } from 'programs/contexts';
import { StepCompleteTask } from 'programs/Step/StepTasklist';
import MenuItem from 'components/MenuItem';
import MenuItemText from 'components/MenuItemText';
import MenuLink from 'components/MenuLink';

const StepMenu = props => {
  const { cycles, step, team } = props;

  let parentLabel;

  if (step.type === 'single') {
    parentLabel = step.label;
  } else {
    const cycle = cycles.find(c => c.uid === step.parentLabel) || {};
    parentLabel = cycle.uid;
  }

  return (
    <MenuItem>
      <MenuLink
        to={routes.toProgramStep(team.uid, step.type, parentLabel)}
        activeClassName="active"
      >
        {/*
          The StepCompleteTask is a special, hard-coded (non-config file) Task
          defined in StepTasklist. We're importing it here to keep in sync so
          that changes there are reflected here.
        */}
        <StepCompleteTask />
        <MenuItemText>{step.name}</MenuItemText>
      </MenuLink>
    </MenuItem>
  );
};

export default compose(
  withMonoContext,
  withStepContext,
  defaultProps({
    cycles: [],
  }),
  setDisplayName('StepMenu'),
)(StepMenu);
