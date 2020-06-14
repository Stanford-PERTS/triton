import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import { compose } from 'recompose';
import { createSelector } from 'reselect';

/**
 * Map an object of selector functions to a different slice of the state.
 *
 * For example:
 *
 * Given:
 * Our application's state
 * appState = {
 *   fooSlice: {
 *     ...fooData
 *   }
 * }
 *
 * Some selectors for some foo of our application
 * fooSelectors = {
 *   getBar: state => state.bar,
 *   ...
 * }
 *
 * If we are storing fooSelectors state in the 'fooSlice' property of
 * 'appState', then we will want 'fooSelectors' to reference the correct
 * slice of our appState. We can do this by using createSelectors,
 * which uses 'createSelector' from reselect to accomplish this.
 *
 * First, we need a selector that selects 'fooSlice' from the appState.
 *
 * getFooSlice = state => state.fooSlice
 *
 * Then, we pass this and our object of selectors (fooSelectors) to the
 * createSelectors function.
 *
 * boundFooSelectors = createSelectors(getFooSlice, fooSelectors)
 *
 * Now, we can use boundFooSelectors passing our app's state to
 * access the data held within the fooSlice of our appState.
 *
 * bar = boundFooSelectors.getBar(state)
 *
 * @param {function} stateSliceSelector - selector for a slice of the state
 * @param {object} selectors - object of selectors to be bound to slice of state
 * @returns {object} object of bound selectors
 */
const createSelectors = (
  stateSliceSelector = state => state,
  selectors = {},
) => {
  if (typeof stateSliceSelector !== 'function') {
    throw new TypeError(
      'Expected type function for stateSliceSelector parameter',
    );
  }
  if (typeof selectors !== 'object') {
    throw new TypeError('Expected type object for selectors parameter');
  }

  return reduce(
    selectors,
    (boundSelectors, selector, name) => {
      // Using reselect's 'createSelector' to create map each selector to the
      // correct slice of the app state
      boundSelectors[name] = createSelector(
        stateSliceSelector,
        selector,
      );
      return boundSelectors;
    },
    {},
  );
};

export default createSelectors;

export function createAnnotatedSelector(...args) {
  return compose(
    annotateGroupBy,
    annotateListProp,
    annotateList,
    annotateIndexProp,
    createSelector,
  )(...args);
}

/**
 * @param {Function} selector for objects indexed by id
 * @returns {Function} selector for some object property indexed by id, e.g.:
 *   { Team_001: "Awesome Teachers", ... }
 */
function annotateIndexProp(selector) {
  selector._indexProp = {};

  selector.indexProp = prop => {
    let s;

    if (prop in selector._indexProp) {
      s = selector._indexProp[prop];
    } else {
      s = createSelector(
        selector,
        byId => mapValues(byId, o => o[prop]),
      );
      selector._indexProp[prop] = s;
    }

    return s;
  };

  return selector;
}

/**
 * @param {Function} selector for objects indexed by id
 * @returns {Function} selector for list of objects, ordered by name, e.g.:
 *   [ { uid: "Team_001", ... }, ... ]
 */
function annotateList(selector) {
  selector.list = createSelector(
    selector,
    byId => values(byId).sort((a, b) => (a.name > b.name ? 1 : -1)),
  );

  return selector;
}

/**
 * @param {Function} selector for objects indexed by id
 * @returns {Function} selector for list of object properties, e.g.:
 *   [ "Geography", "Geology", "Geometry", ... ]
 */
function annotateListProp(selector) {
  selector._listProp = {};

  selector.listProp = prop => {
    let s;

    if (prop in selector._listProp) {
      s = selector._listProp[prop];
    } else {
      s = createSelector(
        selector.list,
        objs => objs.map(o => o[prop]),
      );
      selector._listProp[prop] = s;
    }

    return s;
  };

  return selector;
}

/**
 * @param {Function} selector for objects indexed by id
 * @returns {Function} selector for lists of objects, indexed by some property:
 *   { User_001: [ { uid: "Classroom_001", contact_id: "User_001"}, ... ], ... }
 */
function annotateGroupBy(selector) {
  selector._groupBy = {};

  selector.groupBy = prop => {
    let s;

    if (prop in selector._groupBy) {
      s = selector._groupBy[prop];
    } else {
      s = createSelector(
        selector.list,
        list => groupBy(list, prop),
      );
      selector._groupBy[prop] = s;
    }

    return s;
  };

  return selector;
}

export const queryResultsSelector = (sliceSelector, queryName) =>
  createAnnotatedSelector(sliceSelector, slice =>
    pickBy(slice.byId, e =>
      (slice.queryResults[queryName] || []).includes(e.uid),
    ),
  );
