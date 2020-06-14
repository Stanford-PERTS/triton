import React from 'react';
import { compose } from 'recompose';
import { Field } from 'redux-form';
import get from 'lodash/get';
import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Blockquote from 'components/Blockquote';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import Section from 'components/Section';
import Show from 'components/Show';

import Form from 'components/Form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import RadioField from 'components/Form/RadioField';
import TextArea from 'components/Form/TextArea';

import { dateFormatTitle } from 'config';

const getTitleDates = cycle => {
  const startDate =
    cycle && cycle.start_date ? cycle.start_date.format(dateFormatTitle) : null;
  const endDate =
    cycle && cycle.end_date ? cycle.end_date.format(dateFormatTitle) : null;

  return startDate && endDate ? `${startDate} - ${endDate}` : '';
};

const EPPracticeJournal = props => {
  const {
    cycle,
    cycles,
    responses,
    task,
    toBack,
    user,
    // redux-form
    form,
    handleSubmit,
    invalid,
    submitting,
  } = props;

  // Find user's response to previous cycle
  const { uid: currentCycleUid } = cycle;
  const currentCycleIndex = cycles.findIndex(c => c.uid === currentCycleUid);

  let plannedChanges = undefined;
  if (currentCycleIndex > 0) {
    const previousCycleIndex = currentCycleIndex - 1;
    const previousCycle = cycles[previousCycleIndex];
    const previousResponse = responses.find(
      r =>
        r.parent_id === previousCycle.uid &&
        r.module_label === task.label &&
        r.user_id === user.uid,
    );
    plannedChanges = get(
      previousResponse,
      'body.changes_next_cycle.value',
      plannedChanges,
    );
  }

  return (
    <Section
      title={`Practice Journal Entry ${getTitleDates(cycle)}`}
      dark
      left={<BackButton to={toBack} />}
    >
      <Form>
        <Show when={cycle && cycle.ordinal === 1}>
          <Card.Content>
            <Field
              name="baseline_report"
              label="What did you learn from your baseline report?"
              component={TextArea}
            />
          </Card.Content>
        </Show>

        <Show when={cycle && cycle.ordinal > 1}>
          <Card.Content>
            <p>
              <strong>
                Last cycle, you planned to make the following changes:
              </strong>
            </p>
            {plannedChanges ? (
              <Blockquote>{plannedChanges}</Blockquote>
            ) : (
              <p>[You didn&rsquo;t specify any planned changes last cycle.]</p>
            )}
          </Card.Content>
          <Card.Content>
            <Field
              name="changes_made"
              label={
                <span>
                  Our plans often evolve in response to our learning. What
                  changes did you end up making? And how do they compare to the
                  changes you initially planned? (If your plans didn&rsquo;t
                  change, just write &ldquo;NA.&rdquo;)
                </span>
              }
              component={TextArea}
            />
          </Card.Content>

          <Card.Content>
            <Field
              name="general_outcome"
              label={
                <span>
                  How do you feel about the practice change(s) you made in the
                  previous cycle?
                </span>
              }
              options={{
                '1': <span>Bad</span>,
                '2': <span>Neither good nor bad</span>,
                '3': <span>Pretty good</span>,
                '4': <span>Very good</span>,
                '5': <span>Great</span>,
                '6': <span>I didn&rsquo;t change anything</span>,
              }}
              component={RadioField}
              row
            />
          </Card.Content>

          <Card.Content>
            <Field
              name="observed_outcomes"
              label={
                <span>
                  What did you learn since the last cycle? What impact did your
                  practice changes have on students&rsquo; classroom behaviors
                  or survey results?
                </span>
              }
              component={TextArea}
            />
          </Card.Content>
        </Show>

        <Card.Content>
          <Field
            name="changes_next_cycle"
            label={
              <span>
                What practice changes do you intend to test in the next cycle
                and why? For example, &ldquo;I&rsquo;m going to try greeting
                every student by name as they enter my class because I want to
                make sure each student feels welcomed and seen in my
                class.&rdquo;
              </span>
            }
            component={TextArea}
          />
        </Card.Content>

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
    </Section>
  );
};

export default compose(
  withReduxFormForResponses({
    form: 'EPPracticeJournal',
  }),
)(EPPracticeJournal);
