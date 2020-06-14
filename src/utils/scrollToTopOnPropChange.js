// scrollToTopOnPropChange will scroll browser to top if there is a change in
// any of the specified props (fromParams) between prevProps and props.
//
// See https://github.com/PERTS/triton/issues/1007
// See https://github.com/PERTS/triton/issues/1243
//
// Note: This is being used in both `ProgramSingleStep` and `ProgramCycleStep`
// because `ProgramContent` doesn't have access to `parentLabel` route params.

// Example usage:
//   export default compose(
//     withRouter,
//     lifecycle({
//       componentDidUpdate(prevProps) {
//         scrollToTopOnPropChange(
//          ['parentLabel', 'page'], prevProps, this.props,
//         );
//       },
//       componentDidMount() {
//         // also needed on mount because we might be coming from single step
//         // to a cycle step (or the reverse) and so componentDidUpdate won't
//         // be called in that case
//         scrollToTopOnPropChange(
//          ['parentLabel', 'page'], null, this.props,
//         );
//       },
//     }),
//   )(ProgramCycleStep);

import forEach from 'lodash/forEach';
import fromParams from 'utils/fromParams';

export default (propNames = [], prevProps, props) => {
  const propNamesArray = Array.isArray(propNames) ? propNames : [propNames];

  forEach(propNamesArray, propName => {
    const prev = fromParams(prevProps)[propName];
    const curr = fromParams(props)[propName];

    const propIsNew = !prev && curr;
    const propHasChanged = prev !== curr;

    if (propIsNew || propHasChanged) {
      window.scrollTo(0, 0);
    }
  });
};
