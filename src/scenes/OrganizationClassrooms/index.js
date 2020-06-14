import { compose, setDisplayName, lifecycle, setPropTypes } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import fromParams from 'utils/fromParams';
import * as teamsActions from 'state/teams/actions';
import selectors from 'state/selectors';
import isEmpty from 'lodash/isEmpty';

import Loading from 'components/Loading';
import OrganizationClassroomsEmpty from './OrganizationClassroomsEmpty';
import OrganizationClassroomsRender from './OrganizationClassroomsRender';

export const propTypes = {
  ...withLoadingPropTypes,
};

const mapStateToProps = (state, props) => ({
  isLoading: selectors.loading.teams(state, props),
  isEmpty: isEmpty(selectors.organization.teams(state, props)),
  teams: selectors.organization.teams.list(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...teamsActions }, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organizationId } = fromParams(this.props);
      this.props.actions.queryTeamsByOrganization(organizationId);
    },
  }),
  setDisplayName('OrganizationClassrooms'),
  setPropTypes(propTypes),
  withLoading({
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: OrganizationClassroomsEmpty,
  }),
)(OrganizationClassroomsRender);
