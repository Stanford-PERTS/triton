import { compose, setDisplayName } from 'recompose';
import { withCycleContext } from 'programs/contexts';

const ShowWhenCycleUnscheduled = ({ children, cycle }) =>
  !cycle.start_date ? children : null;

export default compose(
  withCycleContext,
  setDisplayName('ShowWhenCycleUnscheduled'),
)(ShowWhenCycleUnscheduled);
