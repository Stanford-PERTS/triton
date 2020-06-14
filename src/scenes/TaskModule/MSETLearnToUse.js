import React from 'react';
import styled from 'styled-components/macro';

import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import Figure from 'components/Figure';
import Form from 'components/Form';
import Link from 'components/Link';
import Multicolumn from 'components/Multicolumn';
import Page from 'programs/Page';
import Pages from 'programs/Pages';

import barChartExamplePng from 'assets/programs/mset/bar_chart_example.png';
import inflatableCopilotJpg from 'assets/programs/beleset/inflatable_copilot.jpg';
import indicatorDonePng from 'assets/programs/beleset/indicator_done.png';
import indicatorNotDonePng from 'assets/programs/beleset/indicator_not_done.png';
import leadTaskLabelPng from 'assets/programs/cset/lead_task_label.png';
import navBarScreenshotPng from 'assets/programs/mset/nav_bar_screenshot.png';
import womanReadingPaperLetterJpg from 'assets/programs/mset/woman_reading_paper_letter.jpg';
import studentAtComputerSrc from 'assets/programs/mset/student_at_computer.jpg';

const IndicatorColumnOne = styled.td`
  min-width: 100px;
  padding: 5px 20px 5px 0;
  text-align: center;
`;

const IndicatorColumnTwo = styled.td``;

const MSETLearnToUse = props => {
  const {
    // response,
    toBack,
    // redux-form
    form,
    handleSubmit,
    onSubmit,
  } = props;

  return (
    <Form>
      <Card>
        <Card.Header dark left={<BackButton to={toBack} />}>
          Welcome to Message IT on Copilot
        </Card.Header>
        {/*
          The redux-form form name and handleSubmit must be passed down to the
          Pages component so it has access.
        */}
        <Pages
          showProgress
          form={form}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
        >
          <Page>
            <Card.Content>
              <Multicolumn>
                <div>
                  <h2>What is Copilot?</h2>
                  <p>
                    <strong>Copilot</strong> is a unique professional learning
                    platform that helps educators improve the quality and equity
                    of students&rsquo; learning environments. Copilot hosts the{' '}
                    <strong>Message Improvement Tool (Message IT)</strong>.
                  </p>
                  <p>
                    To get you started, we&rsquo;ve created this brief learning
                    module that will introduce you to:
                  </p>
                  <ul>
                    <li>The Copilot user interface</li>
                    <li>The type of messages you can improve</li>
                    <li>
                      The type of feedback you can get to improve your messages
                    </li>
                    <li>A preview of action steps or tasks</li>
                  </ul>
                  <p>
                    Click the <em>Next</em> button to go to the next page.
                  </p>
                </div>
                <Figure vertical>
                  <img
                    src={inflatableCopilotJpg}
                    alt="An inflatable pilot dummy in an airplane cockpit."
                  />
                  <figcaption>
                    Copilot, as seen in the 1980 hit <em>Airplane</em>. Just
                    kidding.
                  </figcaption>
                </Figure>
              </Multicolumn>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>The Copilot User Interface: Navigation Bar</h2>
              <Multicolumn>
                <Figure vertical>
                  <img
                    src={navBarScreenshotPng}
                    alt="Screenshot focusing on the navigation bar."
                  />
                </Figure>
                <div>
                  <p>
                    Copilot makes it easy to track your progress through Message
                    IT. The <strong>navigation bar</strong> on the left provides
                    shortcuts to key features and options that are otherwise
                    part of the scaffolded experience in <strong>Stages</strong>
                    .
                  </p>
                  <ul>
                    <li>
                      <strong>Settings</strong> enables you to edit the
                      &ldquo;artifact&rdquo; you set up and preview your survey.
                      If you&rsquo;re seeking a collaborative experience, you
                      can also invite project members who can complete the
                      learning modules and view reports.
                    </li>
                    <li>
                      <strong>Reports</strong> provides access to the student
                      feedback reports that are generated each time you survey
                      students.
                    </li>
                    <li>
                      Most importantly, <strong>Stages</strong> walks you
                      through all of the steps involved in implementing Message
                      IT so that you can improve your messages.
                    </li>
                  </ul>
                  <p>
                    If you&rsquo;d like to learn more about any of these
                    settings or have questions about implementation, please
                    reach out to{' '}
                    <a href="mailto:copilot@perts.net">copilot@perts.net</a>.
                  </p>
                </div>
              </Multicolumn>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>The Copilot User Interface: Stages</h2>
              <p>
                Each <strong>stage</strong> has a list of scaffolded tasks that
                can be completed in sequence. While we hope our design is
                intuitive, there are a few items we&rsquo;d like you to notice:
              </p>
              <table>
                <tbody>
                  <tr>
                    <IndicatorColumnOne>
                      <img
                        style={{ height: '25px' }}
                        src={indicatorNotDonePng}
                        alt="indicator for when a task should be completed"
                      />
                    </IndicatorColumnOne>
                    <IndicatorColumnTwo>
                      this task should be completed{' '}
                    </IndicatorColumnTwo>
                  </tr>
                  <tr>
                    <IndicatorColumnOne>
                      <img
                        style={{ height: '25px' }}
                        src={indicatorDonePng}
                        alt="indicator for when a task is complete"
                      />
                    </IndicatorColumnOne>
                    <IndicatorColumnTwo>
                      this task has been completed
                    </IndicatorColumnTwo>
                  </tr>
                  <tr>
                    <IndicatorColumnOne>
                      <img
                        style={{ height: '32px', width: '74px' }}
                        src={leadTaskLabelPng}
                        alt="label for when a lead is responsible for a task"
                      />
                    </IndicatorColumnOne>
                    <IndicatorColumnTwo>
                      this task can only be completed or edited by the Lead and
                      not other project members
                    </IndicatorColumnTwo>
                  </tr>
                </tbody>
              </table>
            </Card.Content>
          </Page>

          <Page>
            <Card.Content>
              <h2>Want to Improve an Artifact? Message IT</h2>
              <p>
                Students engage with a variety of messages and artifacts on a
                daily basis &mdash; from campus and classroom posters to
                presentation slides and images to letters and emails. How
                students interpret these artifacts can have a profound effect on
                their learning experiences.
              </p>
              <Figure horizontal>
                <img
                  src={womanReadingPaperLetterJpg}
                  alt="woman reading a letter"
                />
                <figcaption>
                  Messages that are attuned to students&rsquo; experiences and
                  anticipated feelings can encourage positive behaviors and
                  outcomes.
                </figcaption>
              </Figure>
              <p>
                Consider a course syllabus. Syllabi inherently contain several
                early indicators for students. They can set the stage for a
                course and often convey to students their instructors&rsquo;
                values. How a student interprets a syllabus can have the power
                to encourage or alienate them and consequently impact their
                learning. Messages that harm student outcomes are particularly
                common and problematic when they are transmitted across
                demographic divides to members of marginalized groups, including
                students of color and students who are financially stressed.{' '}
              </p>
              <p>
                Message IT can help educators understand how students are
                interpreting any given artifact along several constructs so they
                can improve their messages (more on those constructs in the next
                page). Educators can collect student feedback on:
              </p>
              <ul>
                <li>
                  administrative communications, like acceptance materials,
                  early alerts, academic standing notifications, or posters
                </li>
                <li>
                  course communications, including welcome emails, syllabi, or
                  progress templates
                </li>
                <li>
                  course materials, like handouts, slides, images, or recorded
                  lectures
                </li>
                <li>other critical artifacts students encounter</li>
              </ul>
            </Card.Content>
          </Page>

          <Page>
            <Card.Content>
              <h2>Measure with Message IT</h2>

              <p>The constructs that can be measured in Message IT include:</p>
              <ul>
                <li>
                  <strong>Social Belonging</strong> - Interpersonal and
                  situational cues signal to students whether they belong (or
                  not) in a particular context. While most students experience
                  some uncertainty about whether they belong in college,
                  students from groups that are underrepresented or negatively
                  stereotyped tend to experience higher rates of belonging
                  uncertainty than others.
                </li>
                <li>
                  <strong>Identity Safety</strong> - Situational cues can signal
                  that one&rsquo;s identity is valued or devalued in a
                  particular context. Identity safety mitigates students&rsquo;
                  sense of belonging uncertainty and enhances academic
                  performance.
                </li>
                <li>
                  <strong>Trust &amp; Fairness</strong> - Communicating in ways
                  that engender trust and a perception of caring can help
                  increase students&rsquo; identity safety and create a more
                  equitable learning climate.
                </li>
              </ul>
              <Figure horizontal>
                <img
                  src={barChartExamplePng}
                  alt="chart of social belonging broken down by demographics"
                />
                <figcaption>
                  Report excerpt with data for the Social Belonging construct.
                </figcaption>
              </Figure>
              <ul>
                <li>
                  <strong>Institutional Growth Mindset</strong> - A growth
                  mindset is the belief that abilities are malleable and can be
                  improved with effort, feedback, and the use of effective
                  learning strategies. In contrast, a fixed mindset is the
                  belief that abilities are innate. When instructors convey a
                  growth mindset about intelligence to students, students
                  experience greater identity safety and motivation and perform
                  better academically.
                </li>
                <li>
                  <strong>Self-Efficacy</strong> - Students experience
                  self-efficacy when they have high confidence in their
                  abilities. Efficacy is a strong predictor of persistence and
                  success. Lack of identity safety can undermine self-efficacy.
                </li>
                <li>
                  <strong>Bureaucratic Hassles</strong> - The difficulties
                  associated with an institution&rsquo;s structures or
                  procedures can be frustrating to everyone. However, they can
                  be particularly harmful for members of historically
                  underrepresented groups and first-generation students because
                  the obstacles created by inscrutable institutional processes
                  can create the impression that one doesn&rsquo;t understand or
                  belong in college.
                </li>
              </ul>
              <p>
                To access a shareable version of this summary, please refer to{' '}
                <Link
                  to="http://perts.net/messageit/measures-summary"
                  externalLink
                >
                  Message IT: Measures Summary
                </Link>
                .
              </p>
              <p>
                To preview the full survey click <em>Settings</em> in the
                navigation bar to the left and then <em>Survey Settings</em>.
              </p>
            </Card.Content>
          </Page>

          <Page>
            <Card.Content>
              <h2>Introduce Message IT to Students</h2>

              <Figure horizontal>
                <img
                  src={studentAtComputerSrc}
                  alt="Students at the computer."
                />
              </Figure>

              <p>
                To get thoughtful, honest, and actionable feedback from
                students, they must understand that:
              </p>
              <ul>
                <li>
                  you intend to use what you learn from them to improve the
                  artifact in ways that enhance motivation, learning, and equity
                </li>
                <li>you genuinely care about their honest responses</li>
              </ul>
              <p>
                In addition, students may not be familiar with the context in
                which they would encounter the artifact. Encourage them to
                imagine they encountered the artifact because it&rsquo;s
                applicable to them. For example, If the artifact is an academic
                probation letter, ask them to imagine they are reviewing the
                artifact while learning they are being placed on academic
                probation. If the artifact is an acceptance letter, ask students
                to imagine they are reviewing the artifact because they were
                just admitted to the college.
              </p>
            </Card.Content>
          </Page>

          <Page>
            <Card.Content>
              <h2>Coming Up</h2>

              <p>
                Message IT can be used in person with students or in a virtual
                environment. In an effort to provide relevant information
                just-in-time, each task includes a brief description. As a
                preview, you can expect to complete the following:
              </p>
              <ul>
                <li>
                  <strong>Decide How to Share the Artifact:</strong> The
                  artifact can be embedded into the feedback survey so students
                  can access the survey and artifact at the same time. It can
                  also be provided to students separate from the survey, as a
                  hard copy, for example.
                </li>
                <li>
                  <strong>Preview Survey:</strong> You can ensure the survey,
                  and any embedded artifact, is ready for students to access.
                </li>
                <li>
                  <strong>Collect Student Feedback:</strong> We provide a unique
                  link that can be shared via email with students. We also
                  provide simple instructions that can be provided verbally to
                  students.
                </li>
                <li>
                  <strong>Review Report:</strong> Reports include student
                  feedback that is easy to read and actionable.
                </li>
                <li>
                  <strong>Advanced Options:</strong> Interested in iterative
                  improvement or A-B testing? Message IT walks you through
                  creating multiple &ldquo;artifacts&rdquo; and activating the
                  &ldquo;collections&rdquo; feature to compare them.
                </li>
              </ul>
            </Card.Content>
          </Page>
        </Pages>
      </Card>
    </Form>
  );
};

export default withReduxFormForResponses({
  form: 'MSETLearnToUse',
})(MSETLearnToUse);
