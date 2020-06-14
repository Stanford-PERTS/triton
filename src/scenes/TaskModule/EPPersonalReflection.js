import React from 'react';
import { compose } from 'recompose';
import { Field } from 'redux-form';
import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import Response from 'programs/Response';
import BackButton from 'components/BackButton';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import Section from 'components/Section';
import Show from 'components/Show';

import Form from 'components/Form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import TextArea from 'components/Form/TextArea';

const DisplayPracticeJournalResponses = ({ cycle, user }) => (
  <div>
    <Show when={cycle.ordinal === 1}>
      <Card.Content>
        <div>
          <strong>
            Cycle {cycle.ordinal}: What did you learn from your baseline report?
          </strong>
        </div>
        <div>
          <Response
            responseType="User"
            parentId={cycle.uid}
            userId={user.uid}
            moduleLabel="EPPracticeJournal"
            name="baseline_report"
            defaultValue="[You did not answer this question]"
          />
        </div>
      </Card.Content>
    </Show>

    <Show when={cycle.ordinal > 1}>
      <Card.Content>
        <div>
          <strong>Cycle {cycle.ordinal}: What did you say you learned?</strong>
        </div>
        <div>
          <Response
            responseType="User"
            parentId={cycle.uid}
            userId={user.uid}
            moduleLabel="EPPracticeJournal"
            name="observed_outcomes"
            defaultValue="[You did not answer this question]"
          />
        </div>
      </Card.Content>
    </Show>

    <Card.Content>
      <div>
        <strong>
          Cycle {cycle.ordinal}: What did you intend to change next?
        </strong>
      </div>
      <div>
        <Response
          responseType="User"
          parentId={cycle.uid}
          userId={user.uid}
          moduleLabel="EPPracticeJournal"
          name="changes_next_cycle"
          defaultValue="[You did not answer this question]"
        />
      </div>
    </Card.Content>
  </div>
);

const EPSchoolContextSurvey = props => {
  const {
    cycles,
    task,
    toBack,
    user,
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
        <Card.Header>Goal</Card.Header>
        <Card.Content>
          This reflection module will help you review your learnings so that you
          can share them with your teammates at the Team Reflection Meeting.
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>Your Practice Journal Entries</Card.Header>
        {cycles.map(cycle => (
          <DisplayPracticeJournalResponses
            key={cycle.uid}
            cycle={cycle}
            user={user}
          />
        ))}
      </Card>

      <Card>
        <Card.Header>Synthesis</Card.Header>
        <Card.Content>
          <Field
            name="synthesis_insight"
            label={
              <span>
                Reflecting on your journal entries and experiences, what were
                the top 2-3 insights you developed about your students and your
                practice over the course of the Engagement Project?
              </span>
            }
            component={TextArea}
          />

          <Field
            name="synthesis_student_attitudes"
            label={[
              'What, if anything, have you noticed change in your students',
              'attitudes or behaviors?',
            ].join(' ')}
            component={TextArea}
          />

          <Field
            name="synthesis_challenging"
            label={
              <span>
                What was most challenging about this process, and what
                recommendations might you provide to teachers participating in
                the future?
              </span>
            }
            component={TextArea}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>Help Us Reflect & Improve</Card.Header>
        <Card.Content>
          <Field
            name="help_how_likely"
            label={
              <span>
                How likely are you to recommend the Engagement Project to
                colleagues?
              </span>
            }
            component={TextArea}
          />

          <Field
            name="help_how_improve"
            label={
              <span>
                How could we improve the Engagement Project for next year? We
                read every response and take your detailed feedback very
                seriously.
              </span>
            }
            component={TextArea}
          />

          <Field
            name="help_stories"
            label={
              <span>
                We know that inspiring students to learn is a complex challenge,
                and we&rsquo;re so excited to hear about and celebrate your
                progress with you. If you have any stories and outcomes
                you&rsquo;d like to share with the broader Engagement Project
                community, please enter them below.
              </span>
            }
            component={TextArea}
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
