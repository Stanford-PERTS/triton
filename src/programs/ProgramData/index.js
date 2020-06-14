import { compose, lifecycle, setDisplayName } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withLoading from 'utils/withLoading';
import { withDisplayContext } from 'programs/contexts';

import selectors from 'state/selectors';
import * as classroomsActions from 'state/classrooms/actions';
import * as cyclesActions from 'state/cycles/actions';
import * as responsesActions from 'state/responses/actions';
import * as usersActions from 'state/users/actions';

import ProgramDataLoading from './ProgramDataLoading';
import ProgramDataRender from './ProgramDataRender';

const mapStateToProps = (state, props) => ({
  isLoading:
    selectors.loading.team(state, props) ||
    selectors.loading.classrooms(state, props) ||
    selectors.loading.cycles(state, props) ||
    selectors.loading.responses(state, props) ||
    selectors.loading.users(state, props),

  program: selectors.program(state, props),
  team: selectors.team(state, props),
  classrooms: selectors.team.classrooms.list(state, props),
  cycles: selectors.team.cycles.list(state, props),
  currentCycle: selectors.team.cycles.current(state, props),
  responses: selectors.responses.team.list(state, props),
  userId: selectors.auth.user.uid(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...classroomsActions,
      ...cyclesActions,
      ...responsesActions,
      ...usersActions,
    },
    dispatch,
  ),
});

export default compose(
  withDisplayContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { display, teamId } = this.props;

      if (display === 'menu') {
        // This component can both query for data and provide it to children via
        // context. Since it might be rendered multiple times, we only want it
        // to query for data once, in the main content area.
        return;
      }

      if (display === 'summary' || display === 'summaryEmitter') {
        console.error('Please use ProgramDataForSummary instead.');
        return;
      }

      const {
        queryClassroomsByTeam,
        queryCyclesByTeam,
        queryResponsesByTeam,
        queryUsersByTeam,
      } = this.props.actions;

      queryClassroomsByTeam(teamId);
      queryCyclesByTeam(teamId);
      queryResponsesByTeam(teamId);
      queryUsersByTeam(teamId);
    },
  }),
  withLoading({
    WhenIdleComponent: ProgramDataLoading,
    WhenInitialLoadingComponent: ProgramDataLoading,
  }),
  setDisplayName('ProgramData'),
)(ProgramDataRender);
