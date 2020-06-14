import React from 'react';
import { compose, setDisplayName } from 'recompose';

import { withDisplayContext } from 'programs/contexts';
import ProgramMenu from './ProgramMenu';
import ProgramTasklist from './ProgramTasklist';
import ProgramTaskModule from './ProgramTaskModule';
import ProgramSummary from './ProgramSummary';

import './styles.css';

const ComponentBasedOnDisplayContext = {
  menu: ProgramMenu,
  tasklist: ProgramTasklist,
  taskmodule: ProgramTaskModule,
  summary: ProgramSummary,
  summaryEmitter: ProgramSummary,
};

const Program = ({ display, children }) => {
  const ComponentToRender = ComponentBasedOnDisplayContext[display];
  return ComponentToRender ? (
    <ComponentToRender>{children}</ComponentToRender>
  ) : null;
};

export default compose(
  withDisplayContext,
  setDisplayName('Program'),
)(Program);
