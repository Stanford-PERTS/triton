// Assumption: The team has only one classroom. This is true for teams that are
// part of a program with `use_classrooms: false`, like mset19.

import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';

import Task from 'programs/Task';
import Card from 'components/Card';
import Link from 'components/Link';

const TaskCollectStudentFeedback = props => {
  const { code } = props;

  const urlPrefix = 'https://neptune.perts.net/participate/portal';
  const url = `${urlPrefix}/${code.replace(' ', '-')}`;

  return (
    <Task type="inline" title="Collect Student Feedback" nowrap>
      <Card.Content>
        <p>
          <strong>If you email survey instructions</strong> include this
          hyperlink:{' '}
          <Link to={url} externalLink>
            {url}
          </Link>
        </p>
        <p>
          <strong>
            If you provide survey instructions verbally and/or in person
          </strong>{' '}
          instruct students to visit perts.me and enter the unique participation
          code for this artifact: <strong>{code}</strong>
        </p>
      </Card.Content>
    </Task>
  );
};

const mapStateToProps = (state, props) => {
  const [teamClassroom] = selectors.team.classrooms.list(state, props);
  const { code } = teamClassroom || { code: '' };
  return { code };
};

export default compose(
  withRouter,
  connect(mapStateToProps),
)(TaskCollectStudentFeedback);
