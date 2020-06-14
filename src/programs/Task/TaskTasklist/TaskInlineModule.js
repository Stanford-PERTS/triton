import React from 'react';
import { compose } from 'recompose';

import reduxFormNameFromProps from 'utils/reduxFormNameFromProps';
import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import TaskCaptainOnlyStyled from './TaskCaptainOnly';
import CompletionTracking from 'programs/CompletionTracking';
import Form from 'components/Form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import Card from 'components/Card';
import IconComplete from 'components/IconComplete';
import InfoBox from 'components/InfoBox';

const TaskInlineModule = props => {
  const {
    children,
    response,
    task,
    // redux-form
    form,
    handleSubmit,
    invalid,
    pristine,
    submitting,
  } = props;

  const progress = (response && response.progress) || 0;
  const complete = progress === 100;

  const showCompletion =
    task.showCompletion === undefined
      ? !task.captainOnlyEditable && !task.captainOnlyVisible
      : task.showCompletion;

  return (
    <Form>
      <Card>
        <Card.Header
          task
          left={<IconComplete complete={complete} />}
          right={<TaskCaptainOnlyStyled />}
        >
          {task.title}
        </Card.Header>
        {children}
        <Card.Content merge>
          <FormSubmitButton
            disabled={pristine || invalid}
            handleSubmit={handleSubmit}
            submitting={submitting}
            submittingText="Submitting"
            data-test="submit"
          >
            {task.buttonText}
          </FormSubmitButton>

          <FormSubmitSucceeded form={form}>
            <InfoBox success>Response saved.</InfoBox>
          </FormSubmitSucceeded>

          <FormSubmitFailed form={form} handleSubmit={handleSubmit}>
            {/* Using the error provided by redux-form-saga */}
          </FormSubmitFailed>
        </Card.Content>

        {showCompletion && <CompletionTracking task={task} />}
      </Card>
    </Form>
  );
};

export default compose(
  reduxFormNameFromProps(
    // Use the task label AND step parentLabel so that this task naming will
    // continue to be unique in single or cycle steps.
    ({ task, step }) => `${task.label}:${step.parentLabel}`,
  ),
  withReduxFormForResponses({}),
)(TaskInlineModule);
