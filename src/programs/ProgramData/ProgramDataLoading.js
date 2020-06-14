import React from 'react';
import Loading from 'components/Loading';
import { withDisplayContext } from 'programs/contexts';

const LoadingComponents = {
  summary: () => (
    <tr>
      <td>Loading&hellip;</td>
    </tr>
  ),
  // We don't need to display a loading message because the `summary` display
  // will already indicate loading above and `summaryEmitter` is just being used
  // to dispatch redux actions for the organization dashboard filters.
  summaryEmitter: () => null,
  default: () => (
    <div>
      <Loading />
    </div>
  ),
};

const ProgramDataLoading = ({ display }) => {
  const LoadingComponent =
    LoadingComponents[display] || LoadingComponents.default;

  return <LoadingComponent />;
};

export default withDisplayContext(ProgramDataLoading);
