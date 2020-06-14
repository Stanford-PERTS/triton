// Example Usage:
//
// <Task type="inline" name="Preview Survey">
//   <SurveyPreviewLink>Click here to preview the survey.</SurveyPreviewLink>
// </Task>

import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import { withAllContexts } from 'programs/contexts';
import { getSurveyParams } from 'services/triton/surveys';
import uri from 'urijs';
import Card from 'components/Card';

const SurveyPreviewLink = ({ children, program, survey }) => {
  if (!program || !survey) {
    return null;
  }

  // Direct copy from src/scenes/Survey. Ideally, I'd like to be able to use a
  // plain JavaScript function that could generate this URL and return a string.
  // TODO figure out a way to create a reusable, but plain JavaScript, function
  // that has access the React code necessary. Possible?
  const surveyPreviewUrl = uri(program.preview_url)
    .setSearch({
      ...getSurveyParams(survey),
      testing: true,
    })
    .toString();

  return <Card.Content to={surveyPreviewUrl}>{children}</Card.Content>;
};

const mapStateToProps = (state, props) => ({
  survey: selectors.team.survey(state, props),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
  withAllContexts,
)(SurveyPreviewLink);
