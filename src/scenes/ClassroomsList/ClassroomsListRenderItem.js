import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import * as routes from 'routes';
import selectors from 'state/selectors';

import Icon, { IconStyled } from 'components/Icon';
import PercentSurveyedChart from 'components/PercentSurveyedChart';
import SectionItem from 'components/SectionItem';
import theme from 'components/theme';

export const EmptyRosterWarning = styled.span`
  padding-left: 15px;
  color: ${theme.palette.warning};

  ${IconStyled} {
    margin: 0 5px;
  }

  a:hover & {
    color: white;
  }
`;

const ClassroomsListRenderItem = ({
  activeCycle,
  classroom,
  percentSurveyed,
  classroomId,
  parentLabel,
  stepType,
  teamId,
}) => {
  const to = parentLabel
    ? routes.toProgramTeamClassroom(
        teamId,
        stepType,
        parentLabel,
        classroom.uid,
      )
    : routes.toTeamClassroom(teamId, classroom.short_uid);

  return (
    <SectionItem key={classroom.uid} to={to}>
      {activeCycle && (
        <PercentSurveyedChart percentSurveyed={percentSurveyed} />
      )}
      {classroom.name} ({classroom.contact_name || classroom.contact_email})
      {classroom.num_students === 0 && (
        <EmptyRosterWarning>
          <Icon names="warning" />
          <em>No students on roster</em>
        </EmptyRosterWarning>
      )}
    </SectionItem>
  );
};

function mapStateToProps(state, props) {
  return {
    percentSurveyed: selectors.classroom.participationByCycle.percent(
      state,
      props,
    ),
  };
}

export default connect(mapStateToProps)(ClassroomsListRenderItem);
