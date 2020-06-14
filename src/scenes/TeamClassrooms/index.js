import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { bindActionCreators } from 'redux';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import * as classroomsActions from 'state/classrooms/actions';
import * as routes from 'routes';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import { withTermsContext } from 'components/TermsContext';

import ClassroomsList from 'scenes/ClassroomsList';

class TeamClassrooms extends React.Component {
  componentDidMount() {
    const { queryClassroomsWithParticipation } = this.props.actions;
    const teamId = this.teamId();
    queryClassroomsWithParticipation(teamId);
  }

  teamId() {
    // This allows us to manually specify a teamId. For example, in the
    // OrganizationClassrooms scene, we want to display multiple team
    // classrooms lists.
    return this.props.teamId || fromParams(this.props).teamId;
  }

  render() {
    const { activeCycle, classrooms, isLoading, teamName, terms } = this.props;
    const { parentLabel, stepType } = fromParams(this.props);

    const teamId = this.teamId();
    const title = teamName ? teamName : `${terms.team} ${terms.classrooms}`;

    const toBack = parentLabel
      ? routes.toProgramStep(teamId, stepType, parentLabel)
      : null;

    const newClassroomRoute = parentLabel
      ? routes.toProgramTeamClassroomNew(teamId, stepType, parentLabel)
      : routes.toNewClassroom(teamId);

    return (
      <ClassroomsList
        activeCycle={activeCycle}
        classrooms={classrooms}
        isEmpty={isEmpty(classrooms)}
        isLoading={isLoading}
        newClassroomRoute={newClassroomRoute}
        parentLabel={parentLabel}
        stepType={stepType}
        teamId={teamId}
        title={title}
        toBack={toBack}
      />
    );
  }
}

const mapStateToProps = (state, props) => ({
  activeCycle: selectors.team.cycles.active(state, props),
  classrooms: selectors.team.classrooms.list(state, props),
  isLoading: selectors.loading.team.classrooms(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...classroomsActions }, dispatch),
});

export default compose(
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(TeamClassrooms);
