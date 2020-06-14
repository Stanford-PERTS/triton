import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, setDisplayName } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import selectors from 'state/selectors';
import * as cyclesActions from 'state/cycles/actions';

import {
  withDisplayContext,
  withMonoContext,
  RenderChildrenWithContext,
} from 'programs/contexts';

import StepMenu from './StepMenu';
import StepTasklist from './StepTasklist';
import StepTaskModule from './StepTaskModule';
import StepSummary from './StepSummary';
import StepSummaryEmitter from './StepSummaryEmitter';

const ComponentBasedOnDisplayContext = {
  menu: StepMenu,
  tasklist: StepTasklist,
  taskmodule: StepTaskModule,
  summary: StepSummary,
  summaryEmitter: StepSummaryEmitter,
};

const Step = props => {
  const {
    cycles,
    display,
    teamParticipationPercent,
    userParticipationPercent,
    // step
    label,
    name,
    parentLabel,
    to,
    type,
    // other props to pass through
    ...rest
  } = props;
  const step = {
    label,
    name,
    parentLabel,
    to,
    type,
  };

  const cycle = cycles.find(c => c.uid === step.parentLabel);
  const contextCycle =
    step.type === 'single'
      ? {}
      : {
          ...cycle,
          teamParticipationPercent,
          userParticipationPercent,
        };

  const ComponentToRender = ComponentBasedOnDisplayContext[display];
  return ComponentToRender ? (
    <RenderChildrenWithContext step={step} cycle={contextCycle}>
      <ComponentToRender {...rest} />
    </RenderChildrenWithContext>
  ) : null;
};

const mapStateToProps = (state, props) => {
  const { display } = props;
  // summary: no call to Neptune, faster, updates infrequently, team-level.
  // others (tasklist): call neptune, accurate, classroom-level.
  const participationSelector =
    display === 'summary'
      ? selectors.cycle.participationPercent
      : selectors.cycle.participationPercentDerived;

  const mergeProps = {
    ...props,
    match: {
      params: {
        teamId: props.team.uid,
      },
    },
  };

  const userPpnSelector = selectors.cycle.participationPercentDerived.authUser(
    state,
    mergeProps,
  );
  return {
    teamParticipationPercent: participationSelector(state, mergeProps),
    userParticipationPercent: userPpnSelector,
  };
};
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(cyclesActions, dispatch),
});

export default compose(
  withDisplayContext,
  withMonoContext,
  setPropTypes({
    type: PropTypes.oneOf(['single', 'cycle', 'link']).isRequired,
    name: (props, propName, componentName) => {
      if (['single', 'link'].includes(props.type)) {
        if (props[propName] === undefined) {
          return new Error(
            `The prop \`${propName}\` is marked as required in ` +
              `\`${componentName}\` when prop \`type\` is set to \`single\`` +
              `or \`link\`.`,
          );
        }

        if (typeof props[propName] !== 'string') {
          return new Error(
            `Invalid prop \`${propName}\` of type \`${typeof props[
              propName
            ]}\` supplied to \`${componentName}\`, expected \`string\`.`,
          );
        }
      }

      return undefined;
    },
    label: (props, propName, componentName) => {
      if (props.type === 'single' && !props[propName]) {
        return new Error(
          `The prop \`${propName}\` is marked as required in ` +
            `\`${componentName}\` when prop \`type\` is set to \`single\`.`,
        );
      }
      return undefined;
    },
    to: (props, propName, componentName) => {
      if (props.type === 'link' && !props[propName]) {
        return new Error(
          `The prop \`${propName}\` is marked as required in ` +
            `\`${componentName}\` when prop \`type\` is set to \`link\`.`,
        );
      }
      return undefined;
    },
  }),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  setDisplayName('Step'),
)(Step);
