import pluralize from 'pluralize';
import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import * as usersActions from 'state/users/actions';
import fromParams from 'utils/fromParams';
import isEmpty from 'lodash/isEmpty';
import selectors from 'state/selectors';
import { withTermsContext } from 'components/TermsContext';

import TeamsList from 'scenes/TeamsList';
import TeamMenu from './TeamMenu';

const mapStateToProps = (state, props) => ({
  isLoading: selectors.loading.teams(state, props),
  isLoadingUsers: selectors.loading.users(state, props),
  isEmpty: isEmpty(selectors.organization.teams(state, props)),

  title: `Associated ${pluralize(props.terms.team)}`,
  newTeamRoute: routes.toOrganizationInstructions(
    fromParams(props).organizationId,
  ),
  Menu: TeamMenu,

  program: selectors.program(state, props),
  teams: selectors.organization.teams.list(state, props),
  user: selectors.authUser(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...teamsActions, ...usersActions }, dispatch),
});

export default compose(
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { organizationId } = fromParams(this.props);
      this.props.actions.queryTeamsByOrganization(organizationId);
      this.props.actions.queryUsersByOrganization(organizationId);
    },
  }),
)(TeamsList);
