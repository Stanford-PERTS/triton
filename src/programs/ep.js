import React from 'react';
import * as routes from 'routes';

import AspectRatio from 'components/AspectRatio';
import Card from 'components/Card';
import Link from 'components/Link';

import { Field } from 'redux-form';
import TextField from 'components/Form/TextField';

/* eslint no-unused-vars: "off" */
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

import cycleTimeline from 'assets/programs/ep/cycleTimeline.png';

export const ProgramDocumentsEP = () => (
  <>
    <p>
      Please refer to the following documents while implementing the Engagement
      Project.
    </p>
    <ul>
      <li>
        <Link externalLink to="https://perts.net/engage/faq">
          FAQ
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/conditions">
          Learning Conditions
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/launch-convening">
          Launch Convening Guide
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/team-setup">
          Team Setup Guide
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/baseline">
          Baseline Meeting Guide
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/cycle-meeting">
          Cycle Meeting Guide
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/team-reflection">
          Team Reflection Guide
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/reflection-convening">
          Reflection Convening Guide
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/report">
          Example Report
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/student-letter">
          Sample Student Letter
        </Link>{' '}
        with customization suggestions
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/parent-letter-english">
          Parent Letter (English)
        </Link>
      </li>
      <li>
        <Link externalLink to="https://perts.net/engage/parent-letter-spanish">
          Parent Letter (Spanish)
        </Link>
      </li>
    </ul>
  </>
);

const ProgramEp = () => (
  <Program>
    <Step type="single" label="orientation" name="Orientation">
      <Task
        type="buttonModule"
        label="EPWatchOrientation"
        title="Watch Copilot Orientation"
        buttonText="I watched the video"
      >
        <Card.Content>
          Watch this quick video to familiarize yourself with the Copilot
          platform.
        </Card.Content>
        <AspectRatio>
          <iframe
            allowFullScreen
            allowtransparency="true"
            frameBorder="0"
            scrolling="no"
            src="https://fast.wistia.net/embed/iframe/hq7f8dxmsc?seo=false"
            title="Engagement Project Overview Video"
          />
        </AspectRatio>
      </Task>

      <Task
        type="inlineModule"
        label="EPImplementationAgreement"
        title="Implementation Agreement"
        buttonText="I have reviewed the Implementation Agreement"
      >
        <Card.Content>
          Please review the{' '}
          <Link to="https://perts.net/engage/implementation-agreement">
            Implementation Agreement
          </Link>{' '}
          and sign below in order to confirm that you understand the benefits
          and responsibilities of participating in the Engagement Project.
        </Card.Content>
        <Card.Content>
          <Field
            name="signature"
            label="Signature"
            placeholder="Enter your name here"
            component={TextField}
            type="text"
            required
          />
        </Card.Content>
      </Task>

      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyEditable
        label="EPLaunchConvening"
        title="Launch Convening"
        buttonText="We held a launch convening"
      >
        <Card.Content>
          The Launch Convening introduces the Engagement Project to all of the
          key stakeholders, including all teachers who will implement it and any
          administrators or instructional leaders who will support them.
        </Card.Content>
        <Card.Content to="https://perts.net/engage/launch-convening">
          Read the Launch Convening Guidance
        </Card.Content>
      </Task>

      <Task
        type="link"
        title="Invite Teachers"
        linkText="Invite teachers"
        to={routes.toProgramTeamUsers()}
        completeBySelector="team.users.atLeastTwo"
      >
        Invite your teammates to your engagement team. Teams are normally
        decided at the Launch Convening. A team can have up to 8 teachers.
      </Task>

      <Task
        type="module"
        responseType="Team"
        captainOnlyVisible
        label="EPSchoolContextSurvey"
        title="School Context Survey"
      >
        <ModuleLink>Please tell us more about your team</ModuleLink>
      </Task>
    </Step>

    <Step type="single" label="teamsetup" name="Team Setup">
      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyEditable
        label="EPTeamSetupMeeting"
        title="Team Setup Meeting"
        buttonText="We held our Team Setup Meeting"
      >
        <Card.Content to="https://perts.net/engage/team-setup">
          Meet with your team to plan out your implementation. Read the{' '}
          <em>Team Setup Meeting Guide</em> for guidance.
        </Card.Content>
      </Task>

      <Task
        type="inline"
        captainOnlyEditable
        label="scheduleCycles"
        title="Schedule Cycles"
        completeBySelector="team.cycles.scheduled"
      >
        <p>
          Use the date range selectors below to schedule the first 3 cycles you
          plan to complete. Remember, a cycle begins with surveying students.
          Reports and notification reminders won&rsquo;t work properly unless
          cycle dates are set. You can change your cycle dates at any time.
        </p>
        <p>
          <strong>Cycles must be at least 10 weekdays</strong>.
        </p>
        <TaskScheduleCycleDates />
      </Task>
      <Task
        type="link"
        title="Set up your classes"
        linkText={
          <span>
            Set up each class that will participate in the Engagement Project.
          </span>
        }
        to={routes.toProgramTeamClassrooms()}
      />
    </Step>

    <Step type="cycle">
      <Task
        type="buttonModule"
        title="Introduce Students & Parents"
        label="EPIntroductionLettersSent"
        buttonText="I have introduced the Engagement Project to students"
        showInCycle="1"
        showCompletionTracking
      >
        <Card.Content>
          <p>
            It&rsquo;s important to appropriately introduce the Engagement
            Project to your students so that they understand its purpose. You
            may also choose to introduce it to your students&rsquo; parents. How
            you elect to make these introductions will vary, but here are some
            template letters you can customize and send if you wish:
          </p>
          <ul>
            <li>
              <Link to="https://perts.net/engage/student-letter">
                Sample Student Letter
              </Link>{' '}
              with customization suggestions
            </li>
            <li>
              <Link to="https://perts.net/engage/parent-letter-english">
                Parent Letter (English)
              </Link>
            </li>
            <li>
              <Link to="https://perts.net/engage/parent-letter-spanish">
                Parent Letter (Spanish)
              </Link>
            </li>
          </ul>
        </Card.Content>
      </Task>

      <Task
        type="inline"
        captainOnlyEditable
        title="Set Cycle Dates"
        completeByCycleData="start_date"
        nowrap
      >
        <Card.Content>
          <img src={cycleTimeline} alt="Diagram of a cycle's timeline" />
          <p>
            This cycle is scheduled to take place from{' '}
            <strong>
              <Data
                path="cycle.start_date"
                format="LL"
                defaultValue="[not set]"
              />
            </strong>{' '}
            to{' '}
            <strong>
              <Data
                path="cycle.end_date"
                format="LL"
                defaultValue="[not set]"
              />
            </strong>
          </p>
          <p>
            For more information see the{' '}
            <Link to="https://perts.net/engage/faq">FAQ</Link>.
          </p>
        </Card.Content>
        <Card.Content>
          <TaskInputCycleDateRange
            label={<span>All activities should take place between:</span>}
          />
        </Card.Content>
      </Task>

      <Task
        type="link"
        title="Survey Instructions"
        linkText="View survey instructions"
        to={routes.toProgramSurveyInstructions()}
      >
        Survey students once per cycle before the team meeting. Learn how to
        guide students through the survey.
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
                  <Data path="cycle.teamParticipationPercent" />% of my
                  team&rsquo;s students
                </>
              }
              path="cycle.teamParticipationPercent"
            />
          </TaskSubItem>
        </Card.Content>
        <TaskCycleProgressLinkTeam />
        <TaskCycleProgressLinkUser />
      </Task>

      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyEditable
        label="EPCycleMeetingBaseline"
        title="Baseline Meeting"
        buttonText="We held our baseline meeting"
        showInCycle={1}
        nowrap
      >
        <Card.Content>
          <p>
            Meet with your team to discuss your baseline results. The{' '}
            <em>Baseline Meeting Guide</em> provides an adaptive template for a
            productive meeting.
          </p>
          <p>
            Note: Each teacher should bring a laptop, tablet, or smart phone to
            the meeting so that they can complete their practice journal entry.
          </p>
        </Card.Content>
        <Card.Content to="https://perts.net/engage/baseline">
          Read the Baseline Meeting Guide.
        </Card.Content>
      </Task>

      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyEditable
        label="EPCycleMeeting"
        title="Cycle Meeting"
        buttonText="We held our cycle meeting"
        hideInCycle={1}
        nowrap
      >
        <Card.Content>
          <p>
            Meet with your team to discuss your results and progress. The{' '}
            <em>Cycle Meeting Guide</em> provides an adaptable template for a
            productive meeting.
          </p>
          <p>
            Note: Each teacher should bring a laptop, tablet, or smart phone to
            the meeting so that they can complete their practice journal entry.
          </p>
        </Card.Content>
        <Card.Content to="https://perts.net/engage/cycle-meeting">
          Read the Cycle Meeting Guide
        </Card.Content>
      </Task>

      <Task
        type="module"
        label="EPPracticeJournal"
        title="Complete Your Practice Journal Entry"
        showCompletionTracking
      >
        <Card.Content>
          The Practice Journal will help you track the changes you make each
          cycle and their impact your students. Your journal notes will serve as
          good reminders when you share your learnings with your teammates.
        </Card.Content>
        <ModuleLink>Start your Practice Journal entry</ModuleLink>
      </Task>
    </Step>

    <Step type="single" label="conclusion" name="Conclusion">
      <Task
        type="module"
        label="EPPersonalReflection"
        title="Personal Reflection Module"
        showCompletionTracking
      >
        <Card.Content>
          The Personal Reflection Module will help you revisit your learnings
          and prepare to share them at the Team Reflection Meeting.
        </Card.Content>{' '}
        <ModuleLink>Start the Personal Reflection Module</ModuleLink>
      </Task>

      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyEditable
        label="EPTeamReflectionMeeting"
        title="Team Reflection Meeting"
        buttonText="We held our reflection meeting"
      >
        <Card.Content>
          Meet with your engagement team to share your learnings and to reflect
          on your progress. The Team Reflection Meeting Guide can help you have
          a productive meeting.
        </Card.Content>
        <Card.Content to="https://perts.net/engage/team-reflection">
          Click here for Team Reflection Meeting Guide
        </Card.Content>
      </Task>

      <Task
        type="buttonModule"
        responseType="Team"
        captainOnlyEditable
        label="EPReflectionConvening"
        title="Reflection Convening"
        buttonText="We attended the reflection convening"
      >
        <Card.Content>
          The Reflection Convening brings together all the affiliated teams from
          your school or district to share learnings and celebrate success. If
          there is only one team participating at your school or district, skip
          this step.
        </Card.Content>
        <Card.Content to="https://perts.net/engage/reflection-convening">
          Read the Reflection Convening Guidance
        </Card.Content>
      </Task>

      <Task type="inline" title="Completion Certificate" nowrap>
        <TaskCompletionCertificate />
      </Task>
    </Step>
  </Program>
);

export default ProgramEp;
