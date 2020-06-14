/**
 * One thing user should do while implementing a program. Inside a step.
 *
 * Options for writing programs:
 *
 * @param {string}    props.buttonText           button text for display
 * @param {bool}      props.captainOnlyEditable  only captain may edit
 * @param {bool}      props.captainOnlyInvisible not displayed to captain
 * @param {bool}      props.captainOnlyVisible   only displayed to captain
 * @param {bool}      props.captainResponsible   forces display of captain icon
 * @param {string}    props.completeByCycleData  controls the completion status
 *     indicator according to whether the provided key is set on the cycle.
 * @param {string}    props.completeBySelector   controls the completion status
 *     indicator according to whether a selector return true or false.
 * @param {bool}      props.disabled             if true, appears flat and
 *     gray, discouraging interaction. Any contained fields are disabled.
 * @param {string}    props.label                key for db storage, url param,
 *     and/or indicating which module to when clicking in.
 * @param {string}    props.responseType         only for modules, on which
 *     level to record the responses, one of 'Team', 'Cycle', or 'User'.
 *     Defaults to 'User'.
 * @param {string}    props.linkText             link text for display
 * @param {bool}      props.externalLink         for type "link" tasks, passed
 *     to the Link child, for static resources like pdfs.
 * @param {bool}      props.mayEdit              editable for current user
 * @param {bool}      props.nowrap               if true, style without a Card
 * @param {bool}      props.showCompleteStatus   if true, shows a circle or
 *     checkmark to indicate complete/incomplete
 * @param {bool}      props.showCompletionTracking   shows # teachers completed
 * @param {number}    props.showInCycle          limit display to cycle of this
 *     ordinal; base 10 numeric string also okay
 * @param {string}    props.title                required; title for display
 * @param {string}    props.to                   for "link" type, where to link
 * @param {string}    props.type                 required; options are:
 *     - 'inline' for tasks that happen right in the box, e.g. text only
 *     - 'module' invites you to click into a module
 *     - 'link' displays a radio field, requires `linkText` prop
 *     - 'buttonModule' provides a button to click, saves a `response` like
 *       a module (user-level)
 *     - 'inlineModule' like module, but the form is right there in the task
 *     - {Component} any custom component, e.g. TaskCycleCreateAndAdvance
 *
 * Data properties:
 *
 * @param  {Object}    props.children           child components/nodes
 * @param  {string}    props.userId             id of current user
 * @param  {Object}    props.cycle              current cycle
 * @param  {...mixed}  props.rest               passed to child components as
 *     part of `task`
 *
 * @returns {React.Component}                    rendered Task
 */

import React from 'react';
import { compose, branch, renderNothing, setDisplayName } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import {
  withAllContexts,
  withDisplayContext,
  RenderChildrenWithContext,
} from 'programs/contexts';
import { RESPONSE_TYPE_USER } from 'state/form/TaskModule/actionTypes';

import TaskMenu from './TaskMenu';
import TaskTasklist from './TaskTasklist';
import TaskTaskModule from './TaskTaskModule';
import TaskSummary from './TaskSummary';
import TaskSummaryEmitter from './TaskSummaryEmitter';

const ComponentBasedOnDisplayContext = {
  menu: TaskMenu,
  tasklist: TaskTasklist,
  taskmodule: TaskTaskModule,
  summary: TaskSummary,
  summaryEmitter: TaskSummaryEmitter,
};

const Task = props => {
  const {
    children,
    display,
    responses,
    step,
    userId,
    // task config file props
    buttonText,
    captainOnlyEditable,
    captainOnlyInvisible,
    captainOnlyVisible,
    captainResponsible,
    completeByCycleData,
    completeBySelector,
    disabled,
    hasCaptainPermission,
    label,
    linkText,
    externalLink,
    nowrap,
    reportable,
    responseType = RESPONSE_TYPE_USER,
    showCompleteStatus,
    showCompletionTracking,
    showInCycle,
    title,
    to,
    type,
  } = props;

  // Can the user edit this task?
  const mayEdit =
    hasCaptainPermission || (!captainOnlyEditable && !captainOnlyVisible);

  const task = {
    buttonText,
    captainOnlyEditable,
    captainOnlyInvisible,
    captainOnlyVisible,
    captainResponsible,
    completeByCycleData,
    completeBySelector,
    disabled,
    hasCaptainPermission,
    label,
    linkText,
    externalLink,
    mayEdit,
    nowrap,
    reportable,
    responseType,
    showCompleteStatus,
    showCompletionTracking,
    showInCycle,
    title,
    to,
    type,
  };

  // The response associated with this task
  const response =
    responseType === RESPONSE_TYPE_USER
      ? responses.find(
          r =>
            r.type === responseType &&
            r.user_id === userId &&
            r.parent_id === step.parentLabel &&
            r.module_label === task.label,
        )
      : responses.find(
          r =>
            r.type === responseType &&
            // The main difference is we won't match on userId
            r.parent_id === step.parentLabel &&
            r.module_label === task.label,
        );

  const ComponentToRender = ComponentBasedOnDisplayContext[display];
  return ComponentToRender ? (
    <RenderChildrenWithContext task={task} response={response}>
      <ComponentToRender>{children}</ComponentToRender>
    </RenderChildrenWithContext>
  ) : null;
};

const mapStateToProps = (state, props) => {
  // Hack to make certain tasks appear in the task summary. When in the
  // community dashboard there's no team id in the route, so the team selector
  // returns undefined, and anything that depends on it, like
  // hasCaptainPermission, defaults, and tasks like Cycle Dates become hidden.
  // Not sure why the `teamId` prop passed into ProgramDisplay doesn't already
  // take care of this.
  props = { ...props, teamId: props.team.uid };

  return {
    hasCaptainPermission: selectors.auth.user.hasCaptainPermission(
      state,
      props,
    ),
    userId: selectors.auth.user.uid(state, props),
  };
};

const ifHideInCycleEqualsCycleOrdinal = ({ hideInCycle, cycle }) =>
  hideInCycle && cycle.ordinal === parseInt(hideInCycle, 10);

const ifShowInCycleDoesNotEqualsCycleOrdinal = ({ showInCycle, cycle }) =>
  showInCycle && cycle.ordinal !== parseInt(showInCycle, 10);

// The rule for display menu here is unfortunate, but we'd like to restructure
// all the branching rules below, so it's part of a later/larger refactor.
// The idea is to make sure that non-captains see the checkmarks next to step
// menu items via the StepCompleteTask.
const ifCaptainOnlyVisibleAndNotCaptain = ({
  captainOnlyVisible,
  hasCaptainPermission,
  display,
}) => captainOnlyVisible && !hasCaptainPermission && display !== 'menu';

const ifCaptainOnlyInvisibleAndCaptain = ({
  captainOnlyInvisible,
  hasCaptainPermission,
}) => captainOnlyInvisible && hasCaptainPermission;

export default compose(
  withRouter,
  withDisplayContext,
  withAllContexts,
  connect(mapStateToProps),
  branch(ifHideInCycleEqualsCycleOrdinal, renderNothing),
  branch(ifShowInCycleDoesNotEqualsCycleOrdinal, renderNothing),
  branch(ifCaptainOnlyVisibleAndNotCaptain, renderNothing),
  branch(ifCaptainOnlyInvisibleAndCaptain, renderNothing),
  setDisplayName('Task'),
)(Task);
