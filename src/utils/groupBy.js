import _groupBy from 'lodash/groupBy';

// Wrapper function for lodash's groupBy function that allows it to be used with
// both arrays and single objects.
//
// https://lodash.com/docs/4.17.4#groupBy
//
const groupBy = (entities, transform) => {
  if (Array.isArray(entities)) {
    // if array, just run _.groupBy as usual
    return _groupBy(entities, transform);
  }
  // if a single object, then wrap in an array before calling _.groupBy
  return _groupBy([entities], transform);
};

export default groupBy;
