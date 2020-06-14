import { compose, defaultProps } from 'recompose';
import { withMonoContext } from 'programs/contexts';
import { getDisplaySteps } from 'programs/Program/displaySteps';

const ProgramSummary = props => {
  const { children, cycles } = props;
  const displaySteps = getDisplaySteps(children, cycles);
  return displaySteps;
};

export default compose(
  withMonoContext,
  defaultProps({
    cycles: [],
  }),
)(ProgramSummary);
