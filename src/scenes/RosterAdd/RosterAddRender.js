import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as routes from 'routes';
import fromParams from 'utils/fromParams.js';
import splitAndTrimLines from 'utils/splitAndTrimLines';
import stripToken from 'utils/stripToken';
import { ID_PATTERN } from './validate';

import BackButton from 'components/BackButton';
import RosterAddForm from './RosterAddForm';
import InfoBox from 'components/InfoBox';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const targetGroupFieldName = p => `${p.student_id}:in_target_group`;

export const generateParticipantsFromForm = (
  teamId,
  classroomId,
  existingParticipants,
  studentIdsFromForm,
) => {
  // Collect them in an object, keyed by stripped id, so they're sure to be
  // unique in the way that the db stores them, and filter out ones that
  // already exist.
  const participants = {};
  const existingStripped = existingParticipants.map(p => p.stripped_student_id);
  const studentIds = splitAndTrimLines(studentIdsFromForm)
    .filter(id => !existingStripped.includes(stripToken(id)))
    .filter(id => ID_PATTERN.test(id));

  studentIds.forEach(id => {
    const newParticipant = {
      team_id: teamId,
      classroom_id: classroomId,
      student_id: id,
    };

    participants[stripToken(id)] = newParticipant;
  });

  // Return as an array of unique values.
  return Object.values(participants);
};

class RosterAdd extends React.Component {
  getBackPath() {
    const { classroom, team } = this.props;
    const { parentLabel, stepType } = fromParams(this.props);
    return parentLabel
      ? routes.toProgramTeamClassroom(
          team.uid,
          stepType,
          parentLabel,
          classroom.uid,
        )
      : routes.toTeamClassroom(team.uid, classroom.uid);
  }

  addStudentIds = formValues => {
    const {
      participants,
      actions: { addParticipantsAndRecount },
    } = this.props;
    const { classroomId, teamId } = fromParams(this.props);
    const participantsToAdd = generateParticipantsFromForm(
      teamId,
      classroomId,
      participants,
      formValues.student_ids,
    );

    addParticipantsAndRecount(participantsToAdd, this.getBackPath());
  };

  render() {
    const {
      rosterAddFormValues,
      participants,
      team,
      updatingParticipants,
    } = this.props;

    team.target_group_name = null;

    const toBack = this.getBackPath();

    return (
      <Section dark title="Add Students" left={<BackButton to={toBack} />}>
        <SectionItem>
          <InfoBox>
            <span>
              Please use students&rsquo; <strong>school email addresses</strong>{' '}
              as Roster IDs unless you have made alternate arrangements with
              PERTS.
            </span>
          </InfoBox>
        </SectionItem>
        <RosterAddForm
          addStudentIds={this.addStudentIds}
          participants={participants}
          formValues={rosterAddFormValues}
          updating={updatingParticipants}
        />
      </Section>
    );
  }
}

const mapStateToProps = (state, props) => ({
  initialValues: props.participants.reduce((acc, p) => {
    acc[targetGroupFieldName(p)] = p.in_target_group;
    return acc;
  }, {}),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({ form: 'roster', enableReinitialize: true }),
)(RosterAdd);
