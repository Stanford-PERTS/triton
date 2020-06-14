import React from 'react';
import * as routes from 'routes';

import Card from 'components/Card';
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

export const ProgramDocumentsCSET = null;

const ProgramCSET = () => (
  <Program>
    <Step type="single" label="setup" name="Setup">
      <Task
        label="CSETUnderstandProgram"
        title="Welcome to C-SET on Copilot"
        type="module"
      >
        <ModuleLink>
          This learning module familiarizes you with C-SET
        </ModuleLink>
      </Task>

      <Task
        type="inline"
        captainOnlyEditable
        label="scheduleCycles"
        title="Schedule Cycles"
        completeBySelector="team.cycles.scheduled"
      >
        <p>
          Each cycle defines a distinct period of time during which you will
          survey your students. We recommend surveying students 3-4 times over
          an academic term, timed immediately before or after key academic
          events like midterms or finals.
        </p>
        <p>
          Use the date range selectors below to schedule your first 3 or 4
          cycles. You can change your cycle dates at any time.
        </p>
        <p>
          <strong>
            Cycles must be at least <Data path="program.min_cycle_weekdays" />{' '}
            weekdays
          </strong>
          .
        </p>
        <TaskScheduleCycleDates numToSchedule={4} />
      </Task>

      <Task
        captainOnlyEditable
        linkText={<span>Set up your roster(s)</span>}
        title="Set Up Your Roster"
        to={routes.toProgramTeamClassrooms()}
        type="link"
      >
        Upload a student roster so that Copilot can track students&rsquo;
        responses over time. We recommend you set up a single roster with all of
        the students you want to survey. If you want help setting up multiple
        rosters, email <a href="mailto:copilot@perts.net">copilot@perts.net</a>.
      </Task>
    </Step>

    <Step type="cycle">
      <Task
        type="inline"
        captainOnlyEditable
        title="Survey Window"
        completeByCycleData="start_date"
        nowrap
      >
        <Card.Content>
          Student surveys you collect during the survey window below will be
          associated with this cycle. You can update this cycle&rsquo;s survey
          window at any point by changing the dates below.
        </Card.Content>
        <Card.Content>
          <TaskInputCycleDateRange
            label={<span>Your survey window is set for:</span>}
            getDefaultDates={twoWeeksMondayToFriday}
          />
        </Card.Content>
      </Task>

      <Task
        type="link"
        title="Survey Instructions"
        linkText="View survey instructions"
        to={routes.toProgramSurveyInstructions()}
      >
        Survey students once per cycle. You will get a report the weekend
        following the survey administration.
      </Task>

      <Task type="inline" title="Survey Progress" nowrap>
        <Card.Content>
          <TaskSubItem>
            <TaskProgressBar
              label={
                <>
                  <Data path="cycle.teamParticipationPercent" />% of students
                  surveyed
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
        title="Receive Reports"
        type="link"
        linkText="View reports"
        to={routes.toTeamReports()}
      >
        On the Monday after you are finished surveying your students, go to the{' '}
        <em>Reports</em> section on the left to find your report, or click
        below.
      </Task>
    </Step>
  </Program>
);

export default ProgramCSET;
