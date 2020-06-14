import _keyBy from 'lodash/keyBy';

// Wrapper function for lodash's keyBy function that allows it to be used with
// both arrays and single objects.
//
// https://lodash.com/docs/4.17.4#keyBy
//
const keyBy = (entities, transform) => {
  if (Array.isArray(entities)) {
    // if array, just run _.keyBy as usual
    return _keyBy(entities, transform);
  }
  // if a single object, then wrap in an array before calling _.keyBy
  return _keyBy([entities], transform);
};

export default keyBy;
