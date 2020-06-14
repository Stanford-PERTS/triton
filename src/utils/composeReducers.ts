// composeReducers allows you to pass multiple reducer functions to the same
// redux store slice. These will run left to right.
//
// Example usage:
//
// const reducers = {
//   entities: combineReducers({
//     users: composeReducers(
//       users,
//       entitiesReducer('users', defaultInitialState),
//     ),
//   }),
// };
//
// Note: Only the left-most reducer's initialState will be used in the case
// there is no state provided. This is because the left-most reducer will return
// its initialState and then any following reducers will have a state set.

const composeReducers = (...reducers: Function[]) => (
  state: object,
  action: object,
) =>
  reducers.reduce(
    (prevState, currentReducer) => currentReducer(prevState, action),
    state,
  );

export default composeReducers;
