// Example usage:
//   import { query } from 'state/actions';
//   import selectors from 'state/selectors';
//
//   const mapStateToProps = (state, props) => ({
//     isLoading: selectors.isLoading(state, {
//       action: query('users', { byId: 'Team_2816a21d78f5' }),
//     }),
//     isError: selectors.isError(state, {
//       action: query('users', { byId: 'Team_2816a21d78f5' }),
//     }),
//   })

import { getMetaKeyFromAction } from 'state/helpers';

const defaultCacheStaleTime = 1 * 60 * 1000; // 1 minute

// returns true the provided props.action is awaiting a matching _SUCCESS or
// _FAIURE action to be dispatched.
export const isLoading = (state, props) => {
  const key = getMetaKeyFromAction(props.action);
  return state.meta[key] && state.meta[key].loading;
};

// returns false if no error
// returns the error is there is an error
export const isError = (state, props) => {
  const key = getMetaKeyFromAction(props.action);
  return state.meta[key] && state.meta[key].error;
};

// returns true if the provided props.action has received data from the server
// (indicated by a matching _SUCCESS action being dispatched) has occurred
// within the last `defaultCacheStaleTime` milliseconds.
export const isDataFresh = (state, props) => {
  const key = getMetaKeyFromAction(props.action);
  return (
    state.meta[key] &&
    state.meta[key].lastFetched > Date.now() - defaultCacheStaleTime
  );
};

// convenience selector, for readability, returns the negative of isDataFresh
export const isDataStale = (state, props) => !isDataFresh(state, props);
