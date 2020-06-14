import React from 'react';
import { bindActionCreators } from 'redux';
import { compose, setDisplayName } from 'recompose';
import { connect } from 'react-redux';

import * as classroomsActions from 'state/classrooms/actions';
import * as participantsActions from 'state/participants/actions';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';

import ClassroomDetailsComponent from './ClassroomDetailsComponent';
import Loading from 'components/Loading';
import { withTermsContext } from 'components/TermsContext';

class ClassroomDetails extends React.Component {
  componentDidMount() {
    const { actions } = this.props;
    const { classroomId, teamId } = fromParams(this.props);

    actions.getClassroomDetail(classroomId, teamId);
    actions.queryParticipantsByClassroom(classroomId);
  }

  render() {
    const {
      classroom,
      cycle,
      hasCaptainPermission,
      isContact,
      loading,
      parentLabel,
      participants,
      percentSurveyed,
      rosterCompletion,
      stepType,
      team,
      terms,
      updatingParticipants,
    } = this.props;

    return (
      <div>
        {loading ? (
          <Loading />
        ) : (
          <ClassroomDetailsComponent
            classroom={classroom}
            cycle={cycle}
            hasCaptainPermission={hasCaptainPermission}
            isContact={isContact}
            parentLabel={parentLabel}
            participants={participants}
            percentSurveyed={percentSurveyed}
            stepType={stepType}
            rosterCompletion={rosterCompletion}
            team={team}
            terms={terms}
            updatingParticipants={updatingParticipants}
          />
        )}
      </div>
    );
  }
}

ClassroomDetails.defaultProps = {
  team: {},
  classroom: {},
  participants: [],
};

function mapStateToProps(state, props) {
  return {
    cycle: selectors.team.cycles.active(state, props),
    classroom: selectors.classroom(state, props),
    hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
    isContact: selectors.authUser.classroom.isContact(state, props),
    loading:
      selectors.loading.classroom(state, props) ||
      selectors.loading.participants(state, props),
    parentLabel: fromParams(props).parentLabel,
    participants: selectors.classroom.participants.list(state, props),
    percentSurveyed: selectors.classroom.participationByCycle.percent(
      state,
      props,
    ),
    rosterCompletion: selectors.classroom.completionByParticipantId(
      state,
      props,
    ),
    stepType: fromParams(props).stepType,
    team: selectors.team(state, props),
    updatingParticipants: selectors.updating.participants(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...classroomsActions, ...participantsActions },
      dispatch,
    ),
  };
}

export default compose(
  setDisplayName('ClassroomDetails'),
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ClassroomDetails);
