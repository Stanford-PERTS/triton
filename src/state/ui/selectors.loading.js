import { createSelector } from 'reselect';

import * as routing from 'state/routing/selectors';
import getLoadingKey from './getLoadingKey';
import { actionMethodsFlags } from 'state/actionTypes';

// Names of slices to create loading/adding selectors for.
const slices = [
  // TODO special needs?
  // 'auth',
  'classrooms',
  'cycles',
  'digests',
  'metrics',
  'organizations',
  'participants',
  'programs',
  'reports',
  'responses',
  'surveys',
  'teams',
  // TODO special needs?
  // 'uploads',
  'users',
];

const _loadingSlices = state => state.ui.loading.slices;
const _loadingHoaSlices = state => state.ui.loading.hoaSlices;
const _loadingParents = state => state.ui.loading.parents;
const _loadingEntities = state => state.ui.loading.entities;

const loading = {};
const adding = {};
const updating = {};
const deleting = {};

const isLoading = (state, slice) => state[slice] === actionMethodsFlags.QUERY;
const isAdding = (state, slice) => state[slice] === actionMethodsFlags.ADD;
const isGetting = (state, uid) => state[uid] === actionMethodsFlags.GET;
const isUpdating = (state, uid) => state[uid] === actionMethodsFlags.UPDATE;
const isDeleting = (state, uid) => state[uid] === actionMethodsFlags.DELETE;

slices.forEach(slice => {
  // Create a loading selector for each slice listed in `slices` array.
  // - loading.classrooms, loading.cycles, etc. (not plural)
  loading[slice] = createSelector(
    _loadingSlices,
    state => isLoading(state, slice.toUpperCase()),
  );

  // Create an adding selector for each slice listed in `slices` array.
  // - adding.classrooms, adding.cycles, etc. (note plural)
  adding[slice] = createSelector(
    _loadingSlices,
    state => isAdding(state, slice.toUpperCase()),
  );
});

// Entity level selectors
for (const routingSelectorName in routing) {
  const match = routingSelectorName.match(/route([A-Za-z]+)Id/);
  if (!match) {
    continue;
  }
  const [, entityName] = match;
  const selectorName = entityName.toLowerCase();

  // Create a loading selector for each entity with a routing selector.
  // - loading.classroom, loading.cycle, etc. (note singular)
  // - Note this uses the same namespace (ui.loading) as the slices loading
  //   selector, with these being singular.
  loading[selectorName] = createSelector(
    _loadingEntities,
    routing[routingSelectorName],
    (state, entityUid) => isGetting(state, entityUid),
  );

  // Also, create a loading children selector for each slice.
  // - loading.classroom.children, loading.cycle.children, etc.
  slices.forEach(slice => {
    loading[selectorName][slice] = createSelector(
      _loadingParents,
      routing[routingSelectorName],
      (state, entityUid) =>
        (state[entityUid] && state[entityUid][slice.toUpperCase()]) || false,
    );
  });

  // Create an updating selector for each entity with a routing selector.
  // - updating.classroom, updating.cycle, etc. (note singular)
  updating[selectorName] = createSelector(
    _loadingEntities,
    routing[routingSelectorName],
    (state, entityUid) => isUpdating(state, entityUid),
  );

  // Create a deleting selector for each entity with a routing selector.
  // - deleting.classroom, deleting.cycle, etc. (note singular)
  deleting[selectorName] = createSelector(
    _loadingEntities,
    routing[routingSelectorName],
    (state, entityUid) => isDeleting(state, entityUid),
  );
}

/**
 * A selector-factory. Uses itself as a cache of returned selectors.
 * @param   {Object}   action               HOA action object
 * @param   {string}   action.actionPrefix  arbitrary, describes HOA
 * @param   {string}   action.actionSlice   slice name
 * @returns {Function}                      selector
 */
loading.hoa = action => {
  const loadingKey = getLoadingKey(action);
  if (loading.hoa[loadingKey] === undefined) {
    loading.hoa[loadingKey] = createSelector(
      _loadingHoaSlices,
      state => isLoading(state, loadingKey),
    );
  }

  return loading.hoa[loadingKey];
};

/**
 * A selector-factory. Uses itself as a cache of returned selectors.
 * @param   {Object}   action               HOA action object
 * @param   {string}   action.actionPrefix  arbitrary, describes HOA
 * @param   {string}   action.actionSlice   slice name
 * @returns {Function}                      selector
 */
adding.hoa = action => {
  const loadingKey = getLoadingKey(action);
  if (adding.hoa[loadingKey] === undefined) {
    adding.hoa[loadingKey] = createSelector(
      _loadingHoaSlices,
      state => isAdding(state, loadingKey),
    );
  }

  return adding.hoa[loadingKey];
};

export { adding, loading, updating, deleting };
