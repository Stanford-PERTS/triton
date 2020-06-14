import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm } from 'redux-form';

import { formName } from './config';
import validate from './validate';
import ErrorField from 'components/Form/ErrorField';
import FormActions from 'components/Form/FormActions';
import ToggleField from 'components/Form/ToggleField';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import selectors from 'state/selectors';

/**
 * @param {Object} metric from api
 * @returns {string} first url from first link in metric.links or default.
 * See table definition in metric.py for details on why.
 */
const metricUrl = metric =>
  metric.links.length > 0
    ? metric.links[0].url
    : 'https://www.perts.net/learning-conditions';

const MetricToggles = props => {
  const { activeMetrics, mayEdit, metrics } = props; // ours
  const { fields } = props; // redux-form
  const fieldPairs = fields.map((f, i) => [f, metrics[i]]); // zip

  return (
    <>
      {fieldPairs.map(([field, metric]) => (
        <SectionItem key={metric.uid} className={metric.label}>
          <Field
            component={ToggleField}
            className="metric"
            label={metric.name}
            name={`${field}.metricActive`}
            parse={Boolean}
            target="_blank"
            rel="noopener noreferrer"
            to={metricUrl(metric)}
            disabled={!mayEdit}
          />
          <Field
            component={ToggleField}
            className="open-responses"
            label="Include open response questions"
            name={`${field}.openResponsesActive`}
            parse={Boolean}
            disabled={!mayEdit || !activeMetrics.includes(metric.uid)}
          />
        </SectionItem>
      ))}
    </>
  );
};

const SurveyFormComponent = props => {
  // from Survey index
  const { loading, mayEdit, metrics, onSubmit, surveyFormValues } = props;

  // from redux-form
  const { handleSubmit, submit, pristine, valid } = props;

  // Open response checkboxes need to respond to the values of the metric
  // toggles.
  const activeMetrics = (surveyFormValues.metrics || [])
    .filter(m => m.metricActive)
    .map(m => m.uid);

  return (
    <form className="SurveyForm" onSubmit={handleSubmit(onSubmit)}>
      <Section title="What do you want to measure?" className="metrics">
        <FieldArray
          component={MetricToggles}
          props={{ mayEdit, metrics, activeMetrics }}
          name="metrics"
        />
      </Section>
      <FormActions
        mode="update"
        form="learning conditions"
        handleSubmit={submit}
        submittable={!pristine && valid}
        submitting={loading}
      />
      <Field name="_form" component={ErrorField} />
    </form>
  );
};

SurveyFormComponent.propTypes = {
  mayEdit: PropTypes.bool,
  metrics: PropTypes.arrayOf(PropTypes.object),
  onSubmit: PropTypes.func.isRequired,
  toSurveyInstructions: PropTypes.string.isRequired,
};

SurveyFormComponent.defaultProps = {
  mayEdit: false,
};

const mapStateToProps = (state, props) => {
  const { survey, metrics: programMetrics } = props;
  const surveyMeta = survey && survey.meta;

  const initialValues = {
    ...survey,
    meta: { ...surveyMeta },
    // Make a list of all metrics, but add properties that this form can track
    // related to whether they are active.
    metrics: programMetrics.map(m => ({
      ...m,
      metricActive: survey.metrics.includes(m.uid),
      openResponsesActive: survey.open_responses.includes(m.uid),
    })),
  };

  return {
    // redux form initialization
    // http://redux-form.com/7.0.3/examples/initializeFromState/
    // https://github.com/erikras/redux-form/issues/2012
    initialValues,
    program: selectors.program(state, props),
    surveyFormValues: selectors.form.values(state, { form: formName }) || {},
  };
};

export default compose(
  connect(mapStateToProps),
  reduxForm({ form: formName, validate }),
)(SurveyFormComponent);
