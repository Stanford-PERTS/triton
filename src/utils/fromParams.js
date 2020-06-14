import getLongUid from 'utils/getLongUid';

/**
 * Convert react-router params which contain shortUids into uids.
 * @param  {Object} props react-router params object
 * @return {Object}       converted copy of react-router params object
 *
 * Example:
 *
 *   const props = {
 *     match: {
 *       params: {
 *         teamId: '1a0f71db2372',
 *         classroomId: '00058a3bc0d8'
 *       }
 *     }
 *   };
 *
 *   const { teamId, classroomId } = fromParams(props);
 *
 *   teamId // Team_1a0f71db2372
 *   classroomId // Classroom_00058a3bc0d8
 */

/* eslint complexity: "off" */
const fromParams = props => {
  const convertedParams = {};

  if (!props || !props.match || !props.match.params) {
    return {};
  }

  const {
    match: { params },
  } = props;

  for (const prop in params) {
    if (
      Object.prototype.hasOwnProperty.call(params, prop) &&
      // only convert props that end with `Id`
      prop.endsWith('Id') &&
      // only convert values that don't include `_`, which we're using as a
      // simple check that the value is not already a uid
      params[prop] &&
      !params[prop].includes('_')
    ) {
      // use the param prop name to create the first half of the uid
      // example: `teamId` becomes `Team`
      convertedParams[prop] = getLongUid(
        prop.slice(0, prop.length - 2),
        params[prop],
      );
    } else if (prop === 'page' || prop === 'totalPages') {
      convertedParams[prop] = parseInt(params[prop], 10);
    } else {
      convertedParams[prop] = params[prop];
    }
  }

  return convertedParams;
};

export default fromParams;
