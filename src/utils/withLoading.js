/**
 * Higher Order Component to make loading/updating UI easier.
 *
 * ## What Is This HOC For?
 *
 * This components adds a series of states that a component can be in.
 *
 * ━━━━━━(priority 1)━━━━━━━━━━▶ [isError (an error occurred)]
 * [isIdle] ━> [isLoading] ━┳━━▶ [isEmpty (contains no data)]
 *                          ┗━━▶ [base (contains data)]
 *
 * Except for `base`, none of these states are required. If you don't want to
 * use a state, just don't specify a component for it. Just keep in mind that
 * the `isIdle` state will remain `true` until `isLoading`, `isUpdating`, or
 * `isError` become `true`. So using `isIdle` requires one of the others to be
 * present or else you'll be stuck in the `isIdle` state forever.
 *
 * ## Why Do We Need An isIdle State?
 *
 * The isIdle state to solve the original problem we had been having where there
 * was an initial flash of you have no ${entity}s yet before displaying
 * loading...
 *
 * This occurs because our slices have an initialState of { loading: false } and
 * loading isn't being set to true until the componentDidMount lifecycle state.
 * So there is a brief period of time where we get the empty message until the
 * request action is dispatched.
 * Side note: This was not happening when we were using componentWillMount
 * because request actions were being dispatched before first render and so
 * loading was already set to true. Too bad that's been deprecated.
 *
 * Because of this, we need to decide for all scenes what the UI looks like
 * before the request action is dispatched. My solution was to create the isIdle
 * state.
 *
 * Most times, where we'll always dispatch a request action in
 * componentDidMount, we'll probably just set the WhenIdleComponent equal to
 * WhenLoadingComponent because we intend to start out displaying the loading...
 * UI.
 *
 * ## Usage
 *
 *   import isEmpty from 'lodash/isEmpty';
 *
 *   const TeamWrapper = ({ children }) => <Card>{children}</Card>;
 *   const TeamError = props => <div>Error...</div>;
 *   const TeamIdle = props => <div>Idle...</div>;
 *   const TeamLoading = props => <div>Loading...</div>;
 *   const TeamUpdating = props => <div>Updating...</div>;
 *   const TeamEmpty = props => <div>Empty...</div>
 *   const Team = ({ team }) => <div><h1>Team {team.name}</h1></div>;
 *
 *   const mapStateToProps = (props, state) => ({
 *     isError: selectors.ui.error.team(props, state),
 *     isLoading: selectors.ui.loading.team(props, state),
 *     isUpdating: selectors.ui.updating.team(props, state),
 *     isEmpty: isEmpty(selectors.team(props, state)),
 *     team: selectors.team(props, state),
 *   });
 *
 *   export default compose(
 *    connect(mapStateToProps),
 *    // IMPORTANT! withLoading needs to be provided to compose *after* connect
 *    // so that it receives the isLoading and isUpdating props from connect.
 *    withLoading({
 *      WrapperComponent: TeamWrapper,
 *      WhenErrorComponent: TeamError,
 *      WhenIdleComponent: TeamIdle,
 *      WhenLoadingComponent: TeamLoading,
 *      WhenUpdatingComponent: TeamUpdating,
 *      WhenEmptyComponent: TeamEmpty,
 *    })
 *  )(Team);
 */

import React from 'react';
import PropTypes from 'prop-types';
import { compose, withState, lifecycle } from 'recompose';

// These propTypes are provided so that you can merge these into your
// component propTypes.
//
// Usage:
//   import { withLoadingPropTypes } from 'utils/withLoading';
//   MyComponent.propTypes = {
//     ...withLoadingPropTypes,
//     other: 'propsTypes then can be added.',
//   };
export const withLoadingPropTypes = {
  isError: PropTypes.bool,
  isIdle: PropTypes.bool,
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  isEmpty: PropTypes.bool,
};

// https://github.com/acdlite/recompose/blob/master/docs/API.md#withstate
// Provides an `isIdle` prop with initial value of `true`.
// Provides an `setIdleStatus` function to set value of `isIdle`.
const withIdleState = withState('isIdle', 'setIdleStatus', true);

// https://github.com/acdlite/recompose/blob/master/docs/API.md#lifecycle
// Utilizes the `setIdleState` function provided by `withIdleState` to set the
// `isIdle` flag to false once `isLoading` becomes `true`.
const setIdleFalseWhenActive = lifecycle({
  componentDidUpdate() {
    const {
      isIdle,
      isLoading,
      isUpdating,
      isError,
      setIdleStatus,
    } = this.props;

    if (isIdle && (isLoading || isUpdating || isError)) {
      setIdleStatus(false);
    }
  },
});

// Provides an `hasDisplayedLoading` prop with initial value of `false`
// and `setHasDisplayedLoading` function to set value of `hasDisplayedLoading`.
const withDisplayedLoadingState = withState(
  'hasDisplayedLoading',
  'setHasDisplayedLoading',
  false,
);

// This will set the `hasDisplayedLoading` prop to `true` when the `isLoading`
// flag switches from `true` to `false`. This is used so that we can render the
// optional `WhenInitialLoadingComponent` only the first time that this
// component is in the `isLoading` state. This is useful for components that
// we don't want to unmount/remount after the initial loading state.
const setHasDisplayedLoadingWhenLoading = lifecycle({
  componentDidUpdate(prevProps) {
    const {
      isLoading,
      hasDisplayedLoading,
      setHasDisplayedLoading,
    } = this.props;
    const { isLoading: prevIsLoading } = prevProps;

    if (!hasDisplayedLoading && prevIsLoading && !isLoading) {
      setHasDisplayedLoading(true);
    }
  },
});

// If no WrapperComponent is specified, this default will be used.
const DefaultWrapperComponent = ({ children }) => children;

const withLoading = ({
  // If you specify a WrapperComponent, it will be used to wrap/parent all of
  // the other components specified below when rendering. This allows you to
  // use optional templating that is common to all render states. (optional)
  WrapperComponent = DefaultWrapperComponent,
  // React Component that will be rendered when isError is true (optional)
  WhenErrorComponent,
  // React Component that will be rendered when isIdle is true (optional)
  WhenIdleComponent,
  // React Component that will be rendered when isLoading is true (optional)
  WhenLoadingComponent,
  // React Component that will be rendered with isLoading is true (optional),
  //   but only once. Once the component has gone from isLoading to !isLoading,
  //   it won't display this component again.
  WhenInitialLoadingComponent,
  // React Component that will be rendered when isUpdating is true (optional)
  WhenUpdatingComponent,
  // React Component that will be rendered when isEmpty is true (optional)
  WhenEmptyComponent,
} = {}) =>
  // React Component that will be rendered when not loading/updating
  BaseComponent => {
    // eslint-disable-next-line complexity
    const withLoadingRender = ({
      children, // some components get children, some don't
      hasDisplayedLoading,
      isError,
      // idle flag: Initial, pre-loading, state.
      // This isn't passed in via props, but instead handled internally.
      isIdle,
      isLoading,
      isUpdating,
      isEmpty,
      ...props
    }) => {
      if (isError && WhenErrorComponent) {
        return (
          <WrapperComponent {...props}>
            <WhenErrorComponent {...props}>{children}</WhenErrorComponent>
          </WrapperComponent>
        );
      }

      if (isIdle && WhenIdleComponent) {
        return (
          <WrapperComponent {...props}>
            {/* children are ignored */}
            <WhenIdleComponent {...props} />
          </WrapperComponent>
        );
      }

      if (isLoading && !hasDisplayedLoading && WhenInitialLoadingComponent) {
        return (
          <WrapperComponent {...props}>
            {/* children are ignored */}
            <WhenInitialLoadingComponent {...props} />
          </WrapperComponent>
        );
      }

      if (isLoading && WhenLoadingComponent) {
        return (
          <WrapperComponent {...props}>
            {/* children are ignored */}
            <WhenLoadingComponent {...props} />
          </WrapperComponent>
        );
      }

      if (isUpdating && WhenUpdatingComponent) {
        return (
          <WrapperComponent {...props}>
            <WhenUpdatingComponent {...props}>{children}</WhenUpdatingComponent>
          </WrapperComponent>
        );
      }

      if (isEmpty && WhenEmptyComponent) {
        return (
          <WrapperComponent {...props}>
            <WhenEmptyComponent {...props}>{children}</WhenEmptyComponent>
          </WrapperComponent>
        );
      }

      return (
        <WrapperComponent {...props}>
          <BaseComponent {...props}>{children}</BaseComponent>
        </WrapperComponent>
      );
    };

    return compose(
      withIdleState,
      setIdleFalseWhenActive,
      withDisplayedLoadingState,
      setHasDisplayedLoadingWhenLoading,
    )(withLoadingRender);
  };

export default withLoading;
