import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';

import fromParams from 'utils/fromParams';
import withLoading from 'utils/withLoading';
import validate from './validate';

import selectors from 'state/selectors';
import * as usersActions from 'state/users/actions';
import formAction from 'state/form/userDetails/actions';

import UserDetailsLoading from './UserDetailsLoading';
import UserDetailsRender from './UserDetailsRender';
import UserDetailsWrapper from './UserDetailsWrapper';

// TODO fix empty form when navigating from
//   "team user invite" to self user details

const mapStateToProps = (state, props) => ({
  initialValues: selectors.user(state, props),
  isAdmin: selectors.auth.user.isAdmin(state),
  isLoading: selectors.loading.user(state, props),
  // Some things are only available for users viewing themselves (or supers).
  isSelf: selectors.user(state, props) === selectors.authUser(state),
  user: selectors.user(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(usersActions, dispatch),
});

const load = props => {
  const { teamId, userId } = fromParams(props);
  const { getUserByTeam, getUser } = props.actions;

  if (teamId) {
    getUserByTeam(teamId, userId);
  } else {
    getUser(userId);
  }
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      load(this.props);
    },
    componentDidUpdate(prevProps) {
      const { userId } = fromParams(this.props);
      const { userId: prevUserId } = fromParams(prevProps);
      if (userId !== prevUserId) {
        load(this.props);
      }
    },
  }),
  reduxFormOnSubmit(formAction),
  // reduxForm needs to come before withLoading so that the `dirty` prop is
  // available to the WrapperComponent for properly displaying the BackButton.
  reduxForm({
    form: 'user',
    validate,
    // Necessary for `pristine` prop to update properly after form submit.
    enableReinitialize: true,
  }),
  withLoading({
    WhenLoadingComponent: UserDetailsLoading,
    WrapperComponent: UserDetailsWrapper,
  }),
)(UserDetailsRender);
