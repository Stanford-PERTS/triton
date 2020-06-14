import { compose, setDisplayName, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as organizationsActions from 'state/organizations/actions';
import fromParams from 'utils/fromParams';
import OrganizationRoutes from './OrganizationRoutes';

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(organizationsActions, dispatch),
});

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organizationId } = fromParams(this.props);
      this.props.actions.getOrganizationHome(organizationId);
    },
  }),
  setDisplayName('Organization'),
)(OrganizationRoutes);
