import { compose, setDisplayName, lifecycle, setPropTypes } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import fromParams from 'utils/fromParams';
import * as usersActions from 'state/users/actions';
import * as sharedActions from 'state/shared/actions';
import selectors from 'state/selectors';
import isEmpty from 'lodash/isEmpty';

import Loading from 'components/Loading';
import OrganizationUsersEmpty from './OrganizationUsersEmpty';
import OrganizationUsersRender from './OrganizationUsersRender';

export const propTypes = {
  ...withLoadingPropTypes,
};

const mapStateToProps = (state, props) => ({
  isLoading: selectors.loading.organization.users(state, props),
  isEmpty: isEmpty(selectors.organization.users(state, props)),

  organization: selectors.organization(state, props),
  users: selectors.organization.users.list(state, props),
  userIdLoggedIn: selectors.auth.user.uid(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...usersActions, ...sharedActions }, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organizationId } = fromParams(this.props);
      this.props.actions.queryUsersByOrganization(organizationId);
    },
  }),
  setDisplayName('OrganizationUsers'),
  setPropTypes(propTypes),
  withLoading({
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: OrganizationUsersEmpty,
  }),
)(OrganizationUsersRender);
