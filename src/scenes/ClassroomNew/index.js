import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
  compose,
  defaultProps,
  lifecycle,
  setDisplayName,
  setPropTypes,
} from 'recompose';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as classroomsActions from 'state/classrooms/actions';
import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import formAction from 'state/form/classroomNew/actions';
import fromParams from 'utils/fromParams';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import selectors from 'state/selectors';
import validate from 'scenes/ClassroomSettings/validate';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import { query } from 'state/actions';
import { withTermsContext } from 'components/TermsContext';

import Loading from 'components/Loading';
import ClassroomSettingsRender from 'scenes/ClassroomSettings/ClassroomSettingsRender';

// This file is mostly the same as scenes/ClassroomSettings/index.js. The
// differences are highlighted below in the comments.

// ClassroomNew difference: the path back goes to the class list.
const getBackPath = props => {
  const { parentLabel, stepType, teamId } = fromParams(props);
  // We're adding a new classroom. Going back means the list of classes.
  return parentLabel
    ? routes.toProgramTeamClassrooms(teamId, stepType, parentLabel)
    : routes.toTeamClassrooms(teamId);
};

const mapStateToProps = (state, props) => ({
  // ClassroomNew difference: we need to pick a default contact, since there
  // isn't one set yet. It's either the current user (if they're on the team)
  // or the captain.
  initialValues: {
    contact_id: selectors.team.defaultContact(state, props).uid,
  },
  // meta
  // ClassroomNew difference: deleteRedirect not needed.
  toBack: getBackPath(props),
  isLoading:
    selectors.loading.classroom(state, props) ||
    selectors.loading.team(state, props),
  // data
  classroom: selectors.classroom(state, props),
  classroomNames: selectors.team.classrooms.listProp('name')(state, props),
  team: selectors.team(state, props),
  captain: selectors.team.captain(state, props),
  // ClassroomNew difference: there is no contact yet b/c there is no classroom
  // yet. We select an appropriate default instead.
  defaultContact: selectors.team.defaultContact(state, props),
  hasCaptainPermission: selectors.auth.user.hasCaptainPermission(state, props),
  // ClassroomNew difference: creating a classroom creates a project cohort on
  // Neptune. Having the program here allows us to tell Neptune what program
  // it's part of.
  program: selectors.program(state, props),
  teamUserNamesById: selectors.team.users.namesById(state, props),
  user: selectors.auth.user(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      query,
      ...classroomsActions,
      ...teamsActions,
    },
    dispatch,
  ),
});

export const propTypes = {
  ...withLoadingPropTypes,
  classroom: PropTypes.object,
  team: PropTypes.object,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { classroomId, teamId } = fromParams(this.props);

      this.props.actions.getTeam(teamId);
      this.props.actions.query('users', { byId: teamId });

      if (classroomId) {
        // Not set if we're adding a new classroom.
        this.props.actions.getClassroom(classroomId);
      }
    },
  }),
  setDisplayName('ClassroomNew'),
  setPropTypes(propTypes),
  defaultProps({
    classroom: {},
    team: {},
    user: {},
    contact: {},
  }),
  reduxFormOnSubmit(formAction, {
    // See notes on `program` in mapStateToProps above.
    propsToInclude: ['program', 'team', 'toBack'],
  }),
  // reduxForm needs to come before withLoading so that the `dirty` prop is
  // available to the WrapperComponent for properly displaying the BackButton.
  reduxForm({
    // ClassroomNew difference: this triggers a different form saga which calls
    // POST /api/classrooms instead of PUT /api/classrooms/X
    form: 'classroomNew',
    validate,
    // Necessary for `pristine` prop to update properly after form submit.
    enableReinitialize: true,
  }),
  withTermsContext,
  withLoading({
    WhenLoadingComponent: Loading,
  }),
)(ClassroomSettingsRender);
