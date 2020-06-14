import React from 'react';
import { compose } from 'recompose';
import { Field } from 'redux-form';
import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import Section from 'components/Section';

import Form from 'components/Form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import RadioField from 'components/Form/RadioField';

const EPSchoolContextSurvey = props => {
  const {
    task,
    toBack,
    // redux-form
    form,
    handleSubmit,
    invalid,
    submitting,
  } = props;

  return (
    <Form>
      <Section title={task.title} dark left={<BackButton to={toBack} />} />

      <Card>
        <Card.Header>Title I School</Card.Header>
        <Card.Content>
          <p>Do any of the teachers on this team work at a Title I school?</p>
          <Field
            name="title_one_schools"
            options={{
              yes: 'Yes, all of them.',
              no: 'No, none of them.',
              some: 'Some of them.',
              unsure: "I'm not sure.",
            }}
            component={RadioField}
            row
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>Completion Certificates</Card.Header>
        <Card.Content>
          <p>
            Certificates of Completion will be available for teachers who fully
            implement the Engagement Project.
          </p>
          <p>
            Does Engagement Project participation count towards continuing
            education units in your school or district?
          </p>
          <Field
            name="credit_available"
            options={{
              yes: 'Yes',
              no: 'Not yet',
              unsure: 'Not sure',
            }}
            component={RadioField}
            row
          />
        </Card.Content>
      </Card>

      <FormSubmitButton
        disabled={invalid}
        handleSubmit={handleSubmit}
        submitting={submitting}
        submittingText="Submitting"
        data-test="submit"
      >
        Save
      </FormSubmitButton>

      <FormSubmitSucceeded form={form} timeout={Infinity}>
        <InfoBox success>
          <span>
            Response saved. <Link to={toBack}>Return to task list.</Link>
          </span>
        </InfoBox>
      </FormSubmitSucceeded>

      <FormSubmitFailed form={form}>
        {/* Using the error provided by redux-form-saga */}
      </FormSubmitFailed>
    </Form>
  );
};

export default compose(
  withReduxFormForResponses({
    form: 'EPSchoolContextSurvey',
  }),
)(EPSchoolContextSurvey);
