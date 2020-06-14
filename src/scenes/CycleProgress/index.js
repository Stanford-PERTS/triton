import React from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {
  compose,
  branch,
  lifecycle,
  setDisplayName,
  setPropTypes,
} from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import { redirectTo } from 'state/ui/actions';
import {
  queryCompletionByTeam,
  queryCompletionByUser,
} from 'state/cycles/actions';

import CycleProgressEmpty from './CycleProgressEmpty';
import CycleProgressRender from './CycleProgressRender';
import CycleProgressWrapper from './CycleProgressWrapper';
import Loading from 'components/Loading';

const mapStateToProps = (state, props) => ({
  classroomsById: selectors.team.classrooms(state, props),
  contactClassroomsById: selectors.auth.user.team.classrooms(state, props),
  completionRows: selectors.cycle.completionRows(state, props),
  cycle: selectors.cycle(state, props),
  isLoading:
    selectors.loading.hoa(queryCompletionByTeam())(state, props) ||
    selectors.loading.hoa(queryCompletionByUser())(state, props),
  isEmpty:
    isEmpty(selectors.team.classrooms(state, props)) ||
    isEmpty(selectors.team.participants(state, props)),
  participantsById: selectors.team.participants(state, props),
  hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
  usersById: selectors.team.users(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    { queryCompletionByTeam, queryCompletionByUser, redirectTo },
    dispatch,
  ),
});

const propTypes = {
  ...withLoadingPropTypes,
  classrooms: PropTypes.objectOf(PropTypes.object),
  teamId: PropTypes.string,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  setDisplayName('CycleProgress'),
  setPropTypes(propTypes),
  branch(
    props => fromParams(props).scope === 'team' && !props.hasCaptainPermission,
    () => () => <div>You do not have permission to view this page.</div>,
  ),
  lifecycle({
    componentDidMount() {
      const { teamId, parentLabel: cycleId, scope } = fromParams(this.props);

      if (scope === 'team') {
        this.props.actions.queryCompletionByTeam(teamId, cycleId);
      } else if (scope === 'user') {
        this.props.actions.queryCompletionByUser(cycleId);
      }
    },
  }),
  withLoading({
    WrapperComponent: CycleProgressWrapper,
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: CycleProgressEmpty,
  }),
)(CycleProgressRender);
