// Helper components for getting and setting a components display name. Useful
// for creating Higher Order Components with developer friendly display names.
// https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging

export function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// Why create a setDisplayName function when recompose already provides one?
// The argument signature of recompose's version would require using it like
//
//    setDisplayName('withWrapper(WrappedComponent)')(WrappedComponent);
//
// vs this function using a non-composing argument signature of
//
//    setDisplayName(WrappedComponent, 'withWrapper(WrappedComponent)');

export function setDisplayName(WrappedComponent, displayName) {
  WrappedComponent.displayName = displayName;
}
