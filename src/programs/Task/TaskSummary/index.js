import React from 'react';
import styled from 'styled-components';
import isEqual from 'lodash/isEqual';

import reactChildrenFilter from 'utils/reactChildrenFilter';
import TaskIconComplete from 'programs/Task/TaskTasklist/TaskIconComplete';
import { compose } from 'recompose';
import { withAllContexts } from 'programs/contexts';
import { withTermsContext } from 'components/TermsContext';

import { CardContentStyled } from 'components/Card/CardContent';
import { TableRow } from 'programs/Step/StepSummary';
import { TeamResponsesCol } from 'components/TeamResponses';

// Allows contained "reportable" components to apply different styles.
const TaskSummaryDetailStyled = styled.div`
  // For CompletionTrackingTeam, likely useful for others.
  ${CardContentStyled} {
    padding: 0;
    border: none;
  }
  ${TableRow} & td {
    border: none;
  }
  ${TeamResponsesCol} {
    padding: 4px;

    &:first-child {
      display: none;
    }
  }
`;

class TaskSummary extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (
      !isEqual(this.props.team, nextProps.team) ||
      !isEqual(this.props.classrooms, nextProps.classrooms) ||
      !isEqual(this.props.cycle, nextProps.cycle) ||
      !isEqual(this.props.step, nextProps.step) ||
      !isEqual(this.props.task, nextProps.task)
    ) {
      return true;
    }

    return false;
  }

  render() {
    const { children, task, terms } = this.props;

    const captainResponsible =
      task.captainResponsible ||
      task.captainOnlyVisible ||
      task.captainOnlyEditable;

    const reportable = c => c.props && c.props.reportable;

    return (
      <>
        <td className="first">{task.title}</td>
        <td className="first">
          {captainResponsible ? terms.captain : terms.member}
        </td>
        <td className="first">
          <TaskIconComplete />
        </td>
        <td className="first">
          <TaskSummaryDetailStyled>
            {reactChildrenFilter(children, reportable)}
          </TaskSummaryDetailStyled>
        </td>
      </>
    );
  }
}

export default compose(
  withTermsContext,
  withAllContexts,
)(TaskSummary);
