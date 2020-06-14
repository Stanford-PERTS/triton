import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';

import * as routes from 'routes';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import Link from 'components/Link';
import RosterSection from './RosterSection';
import Show from 'components/Show';

const targetGroupActive = team => team.target_group_name !== null;

const SettingDisplay = styled.div`
  > * {
    display: inline-block;

    :nth-child(1) {
      width: 30%;
      margin-right: 10px;
    }
    :nth-child(2) {
      width: 50%;
    }
    :nth-child(3) {
      float: right;
    }
  }
`;

export class ClassroomDetailsComponent extends React.Component {
  render() {
    const {
      classroom,
      cycle,
      hasCaptainPermission,
      isContact,
      parentLabel,
      participants,
      percentSurveyed,
      stepType,
      team,
      terms, // from context
      updatingParticipants,
    } = this.props;

    const toBack = parentLabel
      ? routes.toProgramTeamClassrooms(team.uid, stepType, parentLabel)
      : routes.toTeamClassrooms(team.uid);

    const toRosterAdd = parentLabel
      ? routes.toProgramTeamRosterAdd(
          team.uid,
          stepType,
          parentLabel,
          classroom.uid,
        )
      : routes.toRosterAdd(team.uid, classroom.uid);

    const toInstructions = parentLabel
      ? routes.toProgramClassroomSurveyInstructions(
          team.uid,
          stepType,
          parentLabel,
          classroom.uid,
        )
      : routes.toClassroomSurveyInstructions(team.uid, classroom.uid);

    const toOtherSettings = parentLabel
      ? routes.toProgramClassroomSettings(
          team.uid,
          stepType,
          parentLabel,
          classroom.uid,
        )
      : routes.toClassroomSettings(team.uid, classroom.uid);

    return (
      <>
        <Card>
          <Card.Header dark left={toBack && <BackButton to={toBack} />}>
            {terms.classroom} Settings
          </Card.Header>
          <Card.Content>
            <SettingDisplay>
              <span>% Surveyed this cycle:</span>
              <Show when={cycle}>
                <strong>{percentSurveyed}%</strong>
              </Show>
              <Show when={!cycle}>
                <em>No active cycle</em>
              </Show>
            </SettingDisplay>
          </Card.Content>
          <Card.Content>
            <SettingDisplay>
              <span>Participation code:</span>
              <strong>{classroom.code}</strong>
            </SettingDisplay>
          </Card.Content>
          <Show when={targetGroupActive(team)}>
            <Card.Content>
              <SettingDisplay>
                <span>Target group name:</span>
                <strong>{team.target_group_name}</strong>
                <Show when={hasCaptainPermission}>
                  <Link to={routes.toTeamDetails(classroom.team_id)}>
                    Change
                  </Link>
                </Show>
              </SettingDisplay>
            </Card.Content>
          </Show>
          <Card.Content to={toInstructions}>Survey Instructions</Card.Content>
          <Show when={hasCaptainPermission || isContact}>
            <Card.Content to={toOtherSettings}>Other Settings</Card.Content>
          </Show>
        </Card>

        <RosterSection
          classroom={classroom}
          mayAddOrRemove={hasCaptainPermission || isContact}
          participants={participants}
          targetGroupActive={targetGroupActive(team)}
          team={team}
          toAdd={toRosterAdd}
          updatingParticipants={updatingParticipants}
        />
      </>
    );
  }
}

ClassroomDetailsComponent.propTypes = {
  classroom: PropTypes.object.isRequired,
  cycle: PropTypes.object,
  hasCaptainPermission: PropTypes.bool,
  isContact: PropTypes.bool,
  parentLabel: PropTypes.string,
  participants: PropTypes.array,
  percentSurveyed: PropTypes.number,
  stepType: PropTypes.string,
  team: PropTypes.object.isRequired,
  terms: PropTypes.object.isRequired,
  updatingParticipants: PropTypes.bool,
};

export default ClassroomDetailsComponent;
