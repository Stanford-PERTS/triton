import { compose, setDisplayName, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import fromParams from 'utils/fromParams';
import * as teamsActions from 'state/teams/actions';

import TeamRoutes from './TeamRoutes';

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(teamsActions, dispatch),
});

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { teamId } = fromParams(this.props);
      this.props.actions.getTeam(teamId);
    },
  }),
  setDisplayName('Team'),
)(TeamRoutes);
