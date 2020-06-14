import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
  compose,
  setDisplayName,
  setPropTypes,
  defaultProps,
  lifecycle,
} from 'recompose';
import { connect } from 'react-redux';

import * as classroomsActions from 'state/classrooms/actions';
import * as participantsActions from 'state/participants/actions';
import * as teamsActions from 'state/teams/actions';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';

import Loading from 'components/Loading';
import RosterAddRender from './RosterAddRender';

const mapStateToProps = (state, props) => ({
  // meta
  isLoading:
    selectors.loading.classroom(state, props) ||
    selectors.loading.team(state, props) ||
    selectors.loading.participants(state, props),
  updatingParticipants: selectors.updating.participants(state, props),
  // data
  classroom: selectors.classroom(state, props),
  team: selectors.team(state, props),
  participants: selectors.classroom.participants.list(state, props),
  // redux-form
  rosterAddFormValues: selectors.form.values(state, {
    form: 'classroomRosterAdd',
  }),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...classroomsActions,
      ...participantsActions,
      ...teamsActions,
    },
    dispatch,
  ),
});

export const propTypes = {
  ...withLoadingPropTypes,
  classroom: PropTypes.object,
  team: PropTypes.object,
  participants: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { classroomId, teamId } = fromParams(this.props);
      const {
        getClassroom,
        getTeam,
        queryParticipantsByClassroom,
      } = this.props.actions;

      getTeam(teamId);
      getClassroom(classroomId);
      queryParticipantsByClassroom(classroomId);
    },
  }),
  setDisplayName('RosterAdd'),
  setPropTypes(propTypes),
  defaultProps({
    classroom: {},
    team: {},
    participants: [],
  }),
  withLoading({
    WhenLoadingComponent: Loading,
  }),
)(RosterAddRender);
