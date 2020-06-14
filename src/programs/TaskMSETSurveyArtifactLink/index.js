// MSET has a special artifact link setting for surveys. This task reuses the
// src/scenes/Scene/SurveyArtifactLink component inline so that users can update
// the settings from within the task list.
// https://github.com/PERTS/triton/issues/1641
// https://github.com/perts/triton/issues/1645

import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import selectors from 'state/selectors';
import * as surveysActions from 'state/surveys/actions';

import Task from 'programs/Task';
import SurveyArtifactLink from 'scenes/Survey/SurveyArtifactLink';
import { formName } from 'scenes/Survey/config';
import validate from 'scenes/Survey/validate';
import Button from 'components/Button';
import SectionItem from 'components/SectionItem';

export const handleSurveyFormSubmit = ({
  actions,
  survey,
  surveyFormValues,
}) => {
  const updatedSurvey = {
    ...survey,
    meta: {
      ...survey.meta,
      ...surveyFormValues.meta,
    },
  };

  actions.updateSurvey(updatedSurvey);
};

const MSETSurveyArtifactLink = props => {
  const { handleSubmit, pristine, invalid, isLoading } = props;

  const onSubmit = () => handleSurveyFormSubmit(props);

  return (
    <Task type="inline" title="Share the Artifact" captainOnlyEditable nowrap>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SurveyArtifactLink />

        <SectionItem>
          <Button
            type="submit"
            disabled={pristine || invalid}
            loading={isLoading}
          >
            Save Changes
          </Button>
        </SectionItem>
      </form>
    </Task>
  );
};

const mapStateToProps = (state, props) => {
  const survey = selectors.team.survey(state, props);
  const surveyMeta = survey && survey.meta;
  const surveyFormValues = selectors.form.values(state, {
    ...props,
    form: formName,
  });
  const isLoading = selectors.loading.surveys(state, props);

  return {
    initialValues: {
      ...survey,
      // If the survey has no meta data saved, then default artifact_use to
      // 'true' so that the form preselects that radio option.
      meta: {
        ...surveyMeta,
        artifact_use: (surveyMeta && surveyMeta.artifact_use) || 'true',
      },
    },
    isLoading,
    survey,
    surveyFormValues,
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...surveysActions,
    },
    dispatch,
  ),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  reduxForm({ form: formName, enableReinitialize: true, validate }),
)(MSETSurveyArtifactLink);
