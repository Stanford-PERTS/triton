import React from 'react';
import * as routes from 'routes';

import Card from 'components/Card';
import Link from 'components/Link';
import twoWeeksMondayToFriday from 'programs/TaskInputCycleDateRange/twoWeeksMondayToFriday';

/* eslint-disable no-unused-vars */
// Disabling no-unused-vars so that we can leave all of the available options
// to team members that are editing this program config file.
import Data from 'programs/Data';
import Program from 'programs/Program';
import FormGroupRow from 'components/Form/FormGroupRow';
import Step from 'programs/Step';
import Task from 'programs/Task';
import TaskCompletionCertificate from 'programs/TaskCompletionCertificate';
import {
  TaskCycleProgressLinkTeam,
  TaskCycleProgressLinkUser,
} from 'programs/TaskCycleProgressLink';
import TaskInputCycleDateRange from 'programs/TaskInputCycleDateRange';
import TaskInputMeetingDate from 'programs/TaskInputMeetingDate';
import TaskInputMeetingLocation from 'programs/TaskInputMeetingLocation';
import TaskInputResolutionDate from 'programs/TaskInputResolutionDate';
import TaskProgressBar from 'programs/TaskProgressBar';
import TaskScheduleCycleDates from 'programs/TaskScheduleCycleDates';
import TaskSubItem from 'programs/TaskSubItem';
import { ModuleLink } from 'programs/Task/TaskTasklist/TaskModule';
/* eslint-enable no-unused-vars */

export const ProgramDocumentsBELESET = () => (
  <>
    <p>
      Please refer to the following documents while implementing the program.
    </p>
    <ul>
      <li>
        <Link to="https://equitablelearning.org">
          BELE Library - equitablelearning.org
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/elevate/measures-summary">
          Copilot-Elevate Measures - perts.net/elevate/measures-summary
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/copilot/faq">
          FAQ - perts.net/copilot/faq
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/report">
          Sample Report - perts.net/engage/report
        </Link>
      </li>
    </ul>
  </>
);

const ProgramBELESET = () => (
  <Program>
    <Step type="single" label="setup" name="Setup" hideStepComplete>
      <Task
        label="BELESETUnderstandProgram"
        title="Understand Copilot-Elevate"
        type="module"
        showCompletionTracking
      >
        <Card.Content>
          This 3-minute orientation module familiarizes you with
          Copilot-Elevate.
        </Card.Content>
        <ModuleLink>
          Complete Learning Module: Understand Copilot-Elevate
        </ModuleLink>
      </Task>

      <Task
        label="BELESETUnderstandMeasures"
        title="Understand the Measures"
        type="module"
        showCompletionTracking
      >
        <Card.Content>
          This brief module describes the student experience measures that your
          students will consider on the survey. To preview the survey (or
          customize measures if you are the project host), click{' '}
          <em>Settings</em> in the navigation bar to the left and then{' '}
          <em>Survey Settings</em>.
        </Card.Content>
        <ModuleLink>
          Complete Learning Module: Understand the Measures{' '}
        </ModuleLink>
      </Task>

      <Task
        type="link"
        title="Set Up Rosters"
        linkText={<span>Set up rosters</span>}
        to={routes.toProgramTeamClassrooms()}
      >
        You will get a separate report for each roster you set up. You can
        create rosters for each class, e.g., &ldquo;Algebra 2 - Period 3,&rdquo;
        or just one roster that groups together all the students you survey,
        e.g., &ldquo;All 9th Graders.&rdquo; For help setting up your rosters,
        email <a href="mailto:support@perts.net">support@perts.net</a>.
      </Task>

      {/*
        This step hides the normal StepCompleteTask, shows this instead.
        It causes the stage in the menu to be checked because the "StepComplete"
        label is a magic value.
      */}

      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyVisible
        label="StepComplete"
        title="Complete This Stage"
        buttonText="Mark Setup Stage Complete"
      >
        <Card.Content>
          Mark stage complete once you (and any other project members) have
          completed the learning modules and set up your rosters.
        </Card.Content>
      </Task>
    </Step>

    <Step type="cycle">
      <Task
        label="BELESETUnderstandCycles"
        title="Understand Cycles"
        type="module"
        showCompletionTracking
        showInCycle="1"
      >
        <Card.Content>
          This brief module familiarizes you with continuous improvement cycles.
        </Card.Content>
        <ModuleLink>Complete Learning Module: Understanding Cycles</ModuleLink>
      </Task>

      <Task
        type="inline"
        captainOnlyEditable
        title="Set Survey Window"
        completeByCycleData="start_date"
        nowrap
      >
        <Card.Content>
          Student surveys you collect during the survey window below will be
          associated with this cycle. By default, the survey window is 2 weeks,
          but you can set a longer or shorter window. We recommend surveying
          students once every 3-5 weeks.
        </Card.Content>
        <Card.Content>
          <TaskInputCycleDateRange
            label={<span>Survey window will run:</span>}
            getDefaultDates={twoWeeksMondayToFriday}
          />
        </Card.Content>
      </Task>

      <Task
        title="Survey Students"
        type="link"
        linkText="Complete Learning Module: Survey Students"
        to={routes.toProgramSurveyInstructions()}
      >
        Survey students once per cycle. This brief learning module includes
        guidance to introduce the survey to students and access instructions.
        You will get a report the weekend after you survey students.
      </Task>

      <Task type="inline" title="Survey Progress" nowrap>
        <Card.Content>
          <TaskSubItem>
            <TaskProgressBar
              label={
                <>
                  <Data path="cycle.userParticipationPercent" />% of my students
                </>
              }
              path="cycle.userParticipationPercent"
            />
          </TaskSubItem>
          <TaskSubItem>
            <TaskProgressBar
              label={
                <>
                  <Data path="cycle.teamParticipationPercent" />% of students in
                  this project
                </>
              }
              path="cycle.teamParticipationPercent"
            />
          </TaskSubItem>
        </Card.Content>
        <TaskCycleProgressLinkUser />
        <TaskCycleProgressLinkTeam />
      </Task>
      <Task
        label="BELESETUnderstandReports"
        showCompletionTracking
        title="Understand Reports"
        type="module"
        showInCycle="1"
      >
        <Card.Content>
          Your reports can be found by clicking <em>Reports</em> in the
          navigation bar to the left. This brief learning module helps you
          interpret student feedback and navigate the library of resources you
          can leverage to improve student experience.
        </Card.Content>
        <ModuleLink>Complete Learning Module: Understand Reports</ModuleLink>
      </Task>
      <Task
        label="BELESETPracticeJournal"
        showCompletionTracking
        title="Complete Practice Journal Entry"
        type="module"
      >
        <Card.Content>
          The practice journal supports reflection, planning, and the sharing of
          best-practices. Complete it after reviewing your report.
        </Card.Content>
        <ModuleLink>Complete Practice Journal Entry</ModuleLink>
      </Task>
    </Step>
  </Program>
);

export default ProgramBELESET;
