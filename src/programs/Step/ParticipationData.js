import { compose, lifecycle } from 'recompose';
import {
  withDisplayContext,
  withMonoContext,
  withCycleContext,
} from 'programs/contexts';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as cyclesActions from 'state/cycles/actions';

const ParticipationData = ({ cycle, classrooms }) => null;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(cyclesActions, dispatch),
});

export default compose(
  withDisplayContext,
  withMonoContext,
  withCycleContext,
  connect(
    null,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { display, cycle, classrooms } = this.props;
      const { queryParticipationByTeam } = this.props.actions;

      // The other modes of display don't need participation information from
      // Neptune: 'menu' and 'taskmodule' don't use participation at all, and
      // 'summary' will use pre-queried stats stored in
      // cycle.students_completed.
      if (display === 'tasklist') {
        queryParticipationByTeam(cycle, classrooms);
      }
    },
    componentDidUpdate(prevProps) {
      const { display, cycle, classrooms } = this.props;
      const { cycle: prevCycle } = prevProps;
      const { queryParticipationByTeam } = this.props.actions;

      if (display !== 'menu' && cycle.uid !== prevCycle.uid) {
        queryParticipationByTeam(cycle, classrooms);
      }
    },
  }),
)(ParticipationData);
