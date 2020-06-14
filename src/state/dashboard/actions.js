// NOTE: This action file is abnormal. Don't auto wrap these functions using
// redux connect. The interval watcher will handle dispatching the batched
// actions. Call addDashboardOptions directly.

import * as types from './actionTypes';
import store from 'state/store';

let batchedOptions = [];
let intervalId;

export const clearOptionWatcher = () => {
  // Clear out existing batched dashboard filter options.
  batchedOptions = [];
  // Clear our existing running intervals.
  clearInterval(intervalId);
};

const dispatchBatchedOptions = () => {
  // If we find any batched options...
  if (batchedOptions.length > 0) {
    // ...dispatch those options to add them to the dashboard.
    store.dispatch({
      type: types.DASHBOARD_ADD_OPTIONS,
      options: batchedOptions,
    });

    // ...and stop the watcher interval.
    clearOptionWatcher();
  }
};

// Call this from `scenes/OrganizationDashboard/index`'s `componentDidMount`
// lifecycle method so that the watcher is started and any existing options
// (from another organization) are cleared out.
export const startOptionWatcher = () => {
  clearOptionWatcher();

  // Clear out any existing dashboard options.
  store.dispatch({ type: types.DASHBOARD_REMOVE_OPTIONS });

  // Start up a new watcher.
  intervalId = setInterval(dispatchBatchedOptions, 50);
};

// This should not be dispatched. Call this directly and allow the interval
// above to batch handle calling dispatch.
export const addDashboardOption = (team, step, task, status) =>
  batchedOptions.push({
    team,
    step,
    task,
    status,
  });
