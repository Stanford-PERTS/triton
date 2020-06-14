// react router passes a location object to all children components of a router,
// which has an optional state object which is userDefined.
// I'm using it to provide a location to come back to.
export const fromLocationTo = ({ pathname = '' }) => (to = '') => ({
  pathname: to,
  state: { from: pathname },
});

// Create a location object to return to location.state.from
// default is to return to root '/'
export const backToLocation = ({ state = { from: '/' } }) => ({
  pathname: state.from,
});
