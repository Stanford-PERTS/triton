import React from 'react';
import values from 'lodash/values';
import { compose } from 'recompose';
import { withRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import * as responseTypes from 'state/form/TaskModule/actionTypes';
import * as routes from 'routes';
import selectors from 'state/selectors';

// In order to make a Task Module available in the app:
// 1. Import all Task Modules that we want to make available at
//   /teams/:teamId/steps/:cycleId/:moduleLabel
import BELESETPracticeJournal from './BELESETPracticeJournal';
import BELESETUnderstandMeasures from './BELESETUnderstandMeasures';
import BELESETUnderstandProgram from './BELESETUnderstandProgram';
import BELESETUnderstandCycles from './BELESETUnderstandCycles';
import BELESETUnderstandReports from './BELESETUnderstandReports';
import CSETUnderstandProgram from './CSETUnderstandProgram';
import DebugModule from './DebugModule';
import DemoSinglePageModule from './DemoSinglePageModule';
import EPExitSurvey from './EPExitSurvey';
import EPPersonalReflection from './EPPersonalReflection';
import EPPracticeJournal from './EPPracticeJournal';
import EPSchoolContextSurvey from './EPSchoolContextSurvey';
import MSETCompareArtifacts from './MSETCompareArtifacts';
import MSETLearnToUse from './MSETLearnToUse';
import TaskModuleWrapper from './TaskModuleWrapper';

// 2. And add the Task Module to this object.
export const ModuleComponents = {
  BELESETPracticeJournal,
  BELESETUnderstandMeasures,
  BELESETUnderstandProgram,
  BELESETUnderstandCycles,
  BELESETUnderstandReports,
  CSETUnderstandProgram,
  DebugModule,
  DemoSinglePageModule,
  EPExitSurvey,
  EPPersonalReflection,
  EPPracticeJournal,
  EPSchoolContextSurvey,
  MSETCompareArtifacts,
  MSETLearnToUse,
};

const moduleComponentWithProps = (Components, props) => () => {
  const { responseType: level, label: moduleLabel } = props.task;

  // The "level" at which the response is to be recorded should map exactly
  // onto a response type.
  if (!values(responseTypes).includes(level)) {
    throw new Error(
      `Route includes a \`level\` which is not a valid response type: ${level}`,
    );
  }

  const TaskModuleComponentToRender = Components[moduleLabel];

  if (!TaskModuleComponentToRender) {
    // eslint-disable-next-line no-console
    console.error(
      [
        `${moduleLabel} task module could not be found.`,
        `Make sure you're providing the correct moduleLabel`,
        `and that it has been added to src/scenes/TaskModule/index.js.`,
      ].join(' '),
    );
    return <div>{moduleLabel} does not exist.</div>;
  }

  return (
    <TaskModuleWrapper ResponseForm={TaskModuleComponentToRender} {...props} />
  );
};

const TaskModule = props => (
  <Switch>
    {/*
      TaskModule routes, like Exit Survey and Practice Journal. These modules
      are loaded based on the route `:moduleLabel`.
    */}
    <Route
      path={routes.toProgramModulePage()}
      render={moduleComponentWithProps(ModuleComponents, props)}
    />

    <Route
      path={routes.toProgramModule()}
      render={moduleComponentWithProps(ModuleComponents, props)}
    />
  </Switch>
);

const mapStateToProps = (state, props) => ({
  user: selectors.auth.user(state, props),
  isCaptain: selectors.authUser.team.isCaptain(state, props),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(TaskModule);
