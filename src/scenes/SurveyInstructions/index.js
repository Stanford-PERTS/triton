import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as cyclesActions from 'state/cycles/actions';
import * as teamsActions from 'state/teams/actions';
import selectors from 'state/selectors';

import BackButton from 'components/BackButton';
import SceneTitle from 'components/SceneTitle';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import SectionLoading from 'components/SectionLoading';
import { withTermsContext } from 'components/TermsContext';

import fromParams from 'utils/fromParams';
import * as route from 'routes';

class SurveyInstructions extends React.Component {
  componentDidMount() {
    const { teamId, parentLabel } = fromParams(this.props);
    const { getTeam, queryCyclesByTeam } = this.props.actions;

    getTeam(teamId);

    // A parentLabel indicates we are displaying this scene under a task list.
    // The task list needs cycles to properly display the stages menu.
    if (parentLabel) {
      queryCyclesByTeam(teamId);
    }
  }

  render() {
    const { teamId, classroomId, stepType, parentLabel } = fromParams(
      this.props,
    );
    const {
      allClassrooms,
      hasCaptainPermission,
      loading,
      terms,
      userClassrooms,
    } = this.props;

    // Since the user can navigate to this page from multiple places,
    // we want to direct the user back to where they came from.
    let toBackRoute;
    if (parentLabel && classroomId) {
      toBackRoute = route.toProgramTeamClassroom(
        teamId,
        stepType,
        parentLabel,
        classroomId,
      );
    } else if (classroomId) {
      toBackRoute = route.toTeamClassroom(teamId, classroomId);
    } else if (parentLabel) {
      toBackRoute = route.toProgramStep(teamId, stepType, parentLabel);
    } else {
      toBackRoute = route.toTeamSurvey(teamId);
    }

    const classrooms = hasCaptainPermission ? allClassrooms : userClassrooms;

    return (
      <div>
        <SceneTitle
          title="Survey Instructions"
          left={<BackButton to={toBackRoute} />}
        />

        <Section title="Step 1: Introduce the Survey Properly">
          <SectionItem>
            <p>
              To get honest and thoughtful responses, participants must
              understand that:
            </p>
            <ol>
              <li>
                You intend to use what you learn from the survey to improve
                their experiences.
              </li>
              <li>You genuinely care about their honest responses.</li>
              <li>
                You will not be able to see individual responses, just averages.
              </li>
            </ol>
          </SectionItem>
        </Section>

        <Section title="Step 2: Direct Participants to the Survey">
          <SectionItem>
            <p>
              After introducing the survey (see above), instruct participants to
              go to <a href="http://perts.me">perts.me</a> and enter the
              participation code for their {terms.classroom.toLowerCase()}. Each
              participant should take the survey independently on an
              internet-enabled computer, phone, or tablet.
            </p>
          </SectionItem>
          <SectionLoading isLoading={loading}>
            Loading participation codes
          </SectionLoading>
          {classrooms.map(classroom => (
            <SectionItem key={classroom.uid}>
              {classroom.name}
              <br />
              <em>Code: {classroom.code}</em>
            </SectionItem>
          ))}
        </Section>

        <Section title="Step 3: After the Survey">
          <SectionItem>
            <ol>
              <li>
                Participants who miss the survey can complete a makeup at any
                time during the cycle.
              </li>
              <li>
                A new report is generated every Monday if new data were
                collected during the previous Monday&ndash;Friday. Only the main
                contact for a roster can see the report for that roster. Data
                are only shown for groups of 5 or more participants.
              </li>
            </ol>
          </SectionItem>
        </Section>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    userClassrooms: selectors.auth.user.team.classrooms.list(state, props),
    allClassrooms: selectors.team.classrooms.list(state, props),
    hasCaptainPermission: selectors.auth.user.hasCaptainPermission(
      state,
      props,
    ),
    loading: selectors.loading.teams(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...cyclesActions, ...teamsActions },
      dispatch,
    ),
  };
}

export default compose(
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(SurveyInstructions);

SurveyInstructions.defaultProps = {
  classrooms: [],
};
