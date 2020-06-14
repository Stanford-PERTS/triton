import * as reportsActions from 'state/reports/actions';
import _isEmpty from 'lodash/isEmpty';
import { bindActionCreators } from 'redux';
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';

import Loading from 'components/Loading';
import ReportsEmpty from './ReportsEmpty';
import ReportsList from './ReportsList';
import ReportsWrapper from './ReportsWrapper';

export const propTypes = {
  ...withLoadingPropTypes,
};

const mapStateToProps = (state, props) => ({
  isLoading:
    selectors.loading.classrooms(state, props) ||
    selectors.loading.reports(state, props) ||
    selectors.loading.teams(state, props),
  isEmpty: _isEmpty(selectors.team.classrooms(state, props)),
  reportsData: selectors.reports(state, props),
  reportsByWeek: selectors.reports.team.classroomReports.allowed.visible(
    state,
    props,
  ),
  teamClassroomsById: selectors.team.classrooms(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(reportsActions, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { teamId } = fromParams(this.props);
      this.props.actions.getTeamReports(teamId);
    },
  }),
  setDisplayName('Organization'),
  setPropTypes(propTypes),
  withLoading({
    WrapperComponent: ReportsWrapper,
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: ReportsEmpty,
  }),
)(ReportsList);
