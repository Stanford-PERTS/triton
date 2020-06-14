import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { addDashboardOption } from 'state/dashboard/actions';
import { withRouter } from 'react-router-dom';
import { withAllContexts, withDisplayContext } from 'programs/contexts';
import { isTaskComplete } from 'programs/Task/TaskTasklist/TaskIconComplete';

const TaskSummaryEmitter = () => null;

const mapStateToProps = (state, props) => {
  const complete = isTaskComplete(state, props);

  return { complete };
};

export default compose(
  withRouter,
  withDisplayContext,
  withAllContexts,
  connect(mapStateToProps),
  lifecycle({
    componentDidMount() {
      const { team, step, task, complete } = this.props;
      addDashboardOption(team, step, task, complete);
    },
  }),
)(TaskSummaryEmitter);
