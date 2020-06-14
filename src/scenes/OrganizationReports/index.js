import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';

import { query } from 'state/actions';

import OrgReportsWrapper from './OrgReportsWrapper';
import OrgReportsLoading from './OrgReportsLoading';
import OrgReportsEmpty from './OrgReportsEmpty';
import OrgReportsRender from './OrgReportsRender';

export const propTypes = {
  ...withLoadingPropTypes,
};

const mapStateToProps = (state, props) => ({
  organization: selectors.organization(state, props),
  isEmpty: selectors.reports.organization.list(state, props).length === 0,
  isLoading:
    selectors.loading.reports(state, props) ||
    selectors.loading.organizations(state, props),
  reports: selectors.reports.organization.list(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ query }, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organizationId } = fromParams(this.props);
      this.props.actions.query('reports', { byId: organizationId });
    },
  }),
  setDisplayName('OrganizationReports'),
  setPropTypes(propTypes),
  withLoading({
    WrapperComponent: OrgReportsWrapper,
    WhenLoadingComponent: OrgReportsLoading,
    WhenEmptyComponent: OrgReportsEmpty,
  }),
)(OrgReportsRender);
