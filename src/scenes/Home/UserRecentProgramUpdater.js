import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';

import * as usersActions from 'state/users/actions';

/**
 * Conditionally dispatches a user update if the user's recent program
 * needs changing. This may occur on mount, or any time the user switches
 * between programs.
 *
 * @return {null} renders nothing; just dispatches (maybe).
 */
const UserRecentProgramUpdater = () => null;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(usersActions, dispatch),
});

export default compose(
  connect(
    null,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { program, user } = this.props;
      const { updateUser } = this.props.actions;

      // recent program id may be null
      if (program.uid !== user.recent_program_id) {
        updateUser({ ...user, recent_program_id: program.uid });
      }
    },

    componentDidUpdate(prevProps) {
      // If the Home scene remains mounted, but the user clicks between
      // different programs, we want to update their most recently viewed
      // program.
      const { program, user } = this.props;
      const { program: prevProgram } = prevProps;
      const { updateUser } = this.props.actions;

      if (program !== prevProgram) {
        updateUser({ ...user, recent_program_id: program.uid });
      }
    },
  }),
)(UserRecentProgramUpdater);
