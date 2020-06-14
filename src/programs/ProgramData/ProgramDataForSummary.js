// Companion to `ProgramData` component: to be used for `display === 'summary'`
// and `display === 'summaryEmitter'` wraps.

import { compose, setDisplayName } from 'recompose';
import { connect } from 'react-redux';
import withLoading from 'utils/withLoading';
import { withDisplayContext } from 'programs/contexts';

import selectors from 'state/selectors';

import ProgramDataLoading from './ProgramDataLoading';
import ProgramDataRender from './ProgramDataRender';

const mapStateToProps = (state, props) => ({
  isLoading: state.ui.loading.hoaSlices.HOA_DASHBOARD_ORGANIZATIONS,

  program: selectors.program(state, props),
  team: selectors.team(state, props),
  classrooms: selectors.team.classrooms.list(state, props),
  cycles: selectors.team.cycles.list(state, props),
  currentCycle: selectors.team.cycles.current(state, props),
  responses: selectors.responses.team.list(state, props),
  userId: selectors.auth.user.uid(state, props),
});

export default compose(
  withDisplayContext,
  connect(mapStateToProps),
  withLoading({
    WhenLoadingComponent: ProgramDataLoading,
  }),
  setDisplayName('ProgramDataForSummary'),
)(ProgramDataRender);
