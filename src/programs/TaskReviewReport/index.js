// Assumption: The team has only one classroom. This is true for teams that are
// part of a program with `use_classrooms: false`, like mset19.

import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import fromParams from 'utils/fromParams';
import * as routes from 'routes';

import Task from 'programs/Task';
import Card from 'components/Card';

const TaskReviewReport = props => {
  const { surveysCompleted } = props;
  const { teamId } = fromParams(props);

  return (
    <Task type="inline" title="Review Report" nowrap>
      <Card.Content>
        Student feedback reports are generated the Monday after students
        complete the survey.
      </Card.Content>
      <Card.Content centered>
        Number of surveys completed: {surveysCompleted}
      </Card.Content>
      <Card.Content to={routes.toTeamReports(teamId)}>
        View Reports
      </Card.Content>
    </Task>
  );
};

const mapStateToProps = (state, props) => {
  const surveysCompleted = selectors.cycle.numOfStudentsCompleted(state, props);
  return { surveysCompleted };
};

export default compose(
  withRouter,
  connect(mapStateToProps),
)(TaskReviewReport);
