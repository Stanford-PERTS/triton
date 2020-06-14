import React from 'react';
import { compose, lifecycle } from 'recompose';
import { Field } from 'redux-form';
import get from 'lodash/get';
import styled from 'styled-components/macro';
import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Blockquote from 'components/Blockquote';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import Show from 'components/Show';

import Form from 'components/Form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import TextArea from 'components/Form/TextArea';
import theme from 'components/theme';

const CheckboxLabel = styled.label`
  margin-left: 10px;
  font-weight: ${theme.units.boldWeight};
`;

const BELESETPracticeJournal = props => {
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
    <Card>
      <Card.Header dark left={<BackButton to={toBack} />}>
        Practice Journal Entry For Cycle {cycle.ordinal}
      </Card.Header>
      <Form>
        <Show when={cycle && cycle.ordinal === 1}>
          <Card.Content>
            <Field
              name="general_reflections"
              label={<span>What reflections do you have?</span>}
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
                  changes did you end up making?
                </span>
              }
              component={TextArea}
            />
          </Card.Content>

          <Card.Content>
            <Field
              name="observed_outcomes"
              label={
                <span>
                  What did you notice since the last cycle? What impact did your
                  practice changes have on students? Please share any
                  reflections you may have.
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
                What practice changes do you intend to implement in the next
                cycle and why? For example, &ldquo;I&rsquo;m going to try
                greeting every student by name as they enter my class because I
                want to make sure each student feels welcomed and seen in my
                class.&rdquo;
              </span>
            }
            component={TextArea}
          />
        </Card.Content>

        <Show when={cycle && cycle.ordinal === 1}>
          <Card.Content>
            <Field
              name="debrief_students"
              label={
                <span>
                  How will you debrief your reflections and plans with your
                  students?
                </span>
              }
              component={TextArea}
            />
          </Card.Content>
        </Show>

        <Card.Content>
          <p>
            We would love to share teachers&rsquo; reflections to help other
            teachers learn. Is it okay to anonymously share your responses to{' '}
            <strong>this</strong> practice journal entry?
          </p>
          <Field
            id="consent_to_share_practice_journal"
            name="consent_to_share_practice_journal"
            component="input"
            type="checkbox"
          />
          <CheckboxLabel htmlFor="consent_to_share_practice_journal">
            I give permission to anonymously share these responses.
          </CheckboxLabel>
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
    </Card>
  );
};

export default compose(
  withReduxFormForResponses({
    form: 'BELESETPracticeJournal',
  }),
  lifecycle({
    componentDidMount() {
      // This will provide a default value for this option.
      // Note #1: another @@redux-form/INITIALIZE action will dispatch after
      // this populating the form from any saved response, so we can trust this
      // default will be correctly overriden by saved data.
      // Note #2: we can't use `initialValues` here because
      // withReduxFormForResponses will override it.
      const { change } = this.props;
      change('consent_to_share_practice_journal', true);
    },
  }),
)(BELESETPracticeJournal);
