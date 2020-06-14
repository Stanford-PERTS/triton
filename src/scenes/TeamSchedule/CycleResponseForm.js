import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import FormActions from 'components/Form/FormActions';
import RadioField from 'components/Form/RadioField';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import TextField from 'components/Form/TextField';

import validate from './validateResponse';
import { dateFormat } from 'config';

export const formName = 'cycleResponse';

const CycleResponseForm = props => {
  /* eslint complexity: "off" */
  const { cycle, onSubmit, updatingResponse } = props;

  // from redux-form
  const { dirty, valid } = props;

  const startDate =
    cycle && cycle.start_date ? cycle.start_date.format(dateFormat) : null;
  const endDate =
    cycle && cycle.end_date ? cycle.end_date.format(dateFormat) : null;
  const formTitle = startDate && endDate ? `${startDate} - ${endDate}` : '';

  const localSubmit = (proxy, event) => {
    const responseMeta = { progress: 100, module_label: 'EPPracticeJournal' };
    onSubmit(proxy, event, responseMeta);
  };

  return (
    <Section title={formTitle}>
      <form>
        {cycle && cycle.ordinal > 0 && (
          <SectionItem>
            <p>
              How do you feel about the practice change(s) you made in the
              previous cycle?
            </p>
            <Field
              name="general_outcome"
              options={{
                '1': 'Bad',
                '2': 'Neither good nor bad',
                '3': 'Pretty good',
                '4': 'Very good',
                '5': 'Great',
                '6': "I didn't change anything",
              }}
              component={RadioField}
            />
          </SectionItem>
        )}
        {cycle && cycle.ordinal > 0 && (
          <SectionItem>
            <p>Tell us more&mdash;how did it go?</p>
            <Field name="observed_outcomes" component={TextField} />
          </SectionItem>
        )}
        <SectionItem>
          <p>
            How do you intend to modify your practice for the NEXT cycle? For
            example, &ldquo;I&rsquo;m going to try greeting every student by
            name as they enter my class.&rdquo;
          </p>
          <Field name="planned_modifications" component={TextField} />
        </SectionItem>
        <SectionItem>
          <p>
            What do you want to accomplish through this change to your practice?
            For example, &ldquo;I want to make sure each student feels welcomed
            and seen in my class.&rdquo;
          </p>
          <Field name="ultimate_goals" component={TextField} />
        </SectionItem>
        <FormActions
          mode="submit"
          form={formName}
          handleSubmit={localSubmit}
          submittable={dirty && valid}
          submitting={updatingResponse}
          data-test="submit-actions"
        />
      </form>
    </Section>
  );
};

const mapStateToProps = (state, props) => ({
  initialValues: props.response ? props.response.body : {},
});

export default compose(
  connect(mapStateToProps),
  reduxForm({ form: formName, enableReinitialize: true, validate }),
)(CycleResponseForm);
