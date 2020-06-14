import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
  compose,
  setDisplayName,
  setPropTypes,
  defaultProps,
  lifecycle,
} from 'recompose';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as classroomsActions from 'state/classrooms/actions';
import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import formAction from 'state/form/classroomSettings/actions';
import fromParams from 'utils/fromParams';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import selectors from 'state/selectors';
import validate from './validate';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import { query } from 'state/actions';
import { withTermsContext } from 'components/TermsContext';

import Loading from 'components/Loading';
import ClassroomSettingsRender from './ClassroomSettingsRender';

const getBackPath = props => {
  const { classroomId, parentLabel, stepType, teamId } = fromParams(props);
  return parentLabel
    ? routes.toProgramTeamClassroom(teamId, stepType, parentLabel, classroomId)
    : routes.toTeamClassroom(teamId, classroomId);
};

const getDeleteRedirect = props => {
  const { parentLabel, stepType, teamId } = fromParams(props);
  return parentLabel
    ? routes.toProgramTeamClassrooms(teamId, stepType, parentLabel)
    : routes.toTeamClassrooms(teamId);
};

const mapStateToProps = (state, props) => ({
  initialValues: selectors.classroom(state, props),
  // meta
  deleteRedirect: getDeleteRedirect(props),
  toBack: getBackPath(props),
  isLoading:
    selectors.loading.classroom(state, props) ||
    selectors.loading.team(state, props),
  // data
  classroom: selectors.classroom(state, props),
  classroomNames: selectors.team.classrooms.listProp('name')(state, props),
  team: selectors.team(state, props),
  captain: selectors.team.captain(state, props),
  contact: selectors.classroom.contact(state, props),
  hasCaptainPermission: selectors.auth.user.hasCaptainPermission(state, props),
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
      this.props.actions.getClassroom(classroomId);
      this.props.actions.query('users', { byId: teamId });
    },
  }),
  setDisplayName('ClassroomSettings'),
  setPropTypes(propTypes),
  defaultProps({
    classroom: {},
    team: {},
    user: {},
    contact: {},
  }),
  reduxFormOnSubmit(formAction),
  // reduxForm needs to come before withLoading so that the `dirty` prop is
  // available to the WrapperComponent for properly displaying the BackButton.
  reduxForm({
    form: 'classroomSettings',
    validate,
    // Necessary for `pristine` prop to update properly after form submit.
    enableReinitialize: true,
  }),
  withTermsContext,
  withLoading({
    WhenLoadingComponent: Loading,
  }),
)(ClassroomSettingsRender);
