import React from 'react';
import * as routes from 'routes';

import Program from 'programs/Program';
import Step from 'programs/Step';
import SurveyPreviewUrl from 'programs/SurveyPreviewLink';
import Task from 'programs/Task';
import { ModuleLink } from 'programs/Task/TaskTasklist/TaskModule';
import Card from 'components/Card';
import TaskMSETSurveyArtifactLink from './TaskMSETSurveyArtifactLink';
import TaskCollectStudentFeedback from './TaskCollectStudentFeedback';
import TaskReviewReport from './TaskReviewReport';

export const ProgramDocumentsMSET = null;

export const stepNames = ['Results'];

export default () => (
  <Program>
    <Step type="single" label="setup" name="Setup">
      <Task
        type="module"
        label="MSETLearnToUse"
        title="Welcome to Message IT on Copilot"
      >
        <Card.Content>
          This 3-minute orientation module explains how to navigate Message IT
          on Copilot. It also describes the types of messages and artifacts you
          can improve and how.
        </Card.Content>
        <ModuleLink>
          Learning Module: Learn to use Message IT on Copilot
        </ModuleLink>
      </Task>

      <TaskMSETSurveyArtifactLink />

      <Task
        type="buttonModule"
        responseType="Team"
        label="MSETPreviewSurvey"
        title="Preview Survey"
        buttonText="I have previewed the survey."
        captainOnlyEditable
      >
        <SurveyPreviewUrl>
          Preview the student survey and if you entered a hyperlink above,
          ensure that the artifact is embedded correctly.
        </SurveyPreviewUrl>
      </Task>

      <TaskCollectStudentFeedback />
    </Step>

    <Step type="cycle" name={stepNames}>
      <TaskReviewReport />

      <Task type="inline" title="Set Up Another Artifact" nowrap>
        <Card.Content>
          <p>
            Message IT can help you collect feedback on various artifacts. You
            can create another artifact now by clicking below or at any time by
            clicking <em>Add</em> next to <em>Your Artifacts</em> on the home
            page.
          </p>
        </Card.Content>
        <Card.Content to={routes.toNewTeam('mset19')}>
          Set Up Another Artifact
        </Card.Content>
      </Task>

      <Task
        type="module"
        label="MSETCompareArtifacts"
        title="Compare Artifacts"
      >
        <Card.Content>
          The &ldquo;collections&rdquo; feature in Message IT can help you
          compare various artifacts. Complete this learning module to learn how.
        </Card.Content>
        <ModuleLink>Learning Module: Compare Artifacts</ModuleLink>
      </Task>
    </Step>
  </Program>
);
