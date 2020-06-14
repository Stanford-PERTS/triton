import React from 'react';
import styled from 'styled-components/macro';

import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import Figure from 'components/Figure';
import Form from 'components/Form';
import Multicolumn from 'components/Multicolumn';
import Page from 'programs/Page';
import Pages from 'programs/Pages';

import inflatableCopilotJpg from 'assets/programs/beleset/inflatable_copilot.jpg';
import indicatorDonePng from 'assets/programs/beleset/indicator_done.png';
import indicatorNotDonePng from 'assets/programs/beleset/indicator_not_done.png';
import leadTaskLabelPng from 'assets/programs/cset/lead_task_label.png';
import navBarScreenshotPng from 'assets/programs/cset/nav_bar_screenshot.png';

const IndicatorColumnOne = styled.td`
  min-width: 100px;
  padding: 5px 20px 5px 0;
  text-align: center;
`;

const IndicatorColumnTwo = styled.td``;

const CSETUnderstandProgram = props => {
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
          Learning Module: Welcome to C-SET on Copilot
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
                    of students&rsquo; learning environment. Copilot hosts the{' '}
                    <strong>College-Student Experience Tracker (C-SET)</strong>.
                  </p>
                  <p>
                    Learning experiences matter and we have designed C-SET to
                    provide you with an intuitive, seamless, and flexible
                    experience. To get you started, we&rsquo;ve created this
                    brief learning module that will introduce you to:
                  </p>
                  <ul>
                    <li>the Copilot user interface</li>
                    <li>student experiences that can be measured with C-SET</li>
                    <li>a preview of action steps or tasks</li>
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
                    alt="screenshot focusing on navigation bar"
                  />
                </Figure>
                <div>
                  <p>
                    The Copilot platform makes it easy to track your tasks and
                    progress through C-SET. The <strong>navigation bar</strong>{' '}
                    on the left provides shortcuts to key features and options
                    that are otherwise part of the scaffolded experience in{' '}
                    <strong>Stages</strong>.
                  </p>
                  <ul>
                    <li>
                      <strong>Settings</strong> enables you to edit your
                      project, preview your survey and, if you&rsquo;re seeking
                      a collaborative experience, invite project members.
                    </li>
                    <li>
                      <strong>Rosters</strong> enables you to update or create
                      new student rosters at any time.
                    </li>
                    <li>
                      <strong>Reports</strong> provides access to the student
                      feedback reports that are generated each time you survey
                      students.
                    </li>
                    <li>
                      Most importantly, <strong>Stages</strong> walks you
                      through all of the steps involved in implementing C-SET so
                      that you can understand and improve the student experience
                      gap.
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
                      identifies tasks that should be completed{' '}
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
                      denotes that a task has been completed
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
                      indicates tasks that are completed or can be edited by the
                      project lead
                    </IndicatorColumnTwo>
                  </tr>
                </tbody>
              </table>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Measures for C-SET</h2>
              <p>The constructs that can be measured in C-SET include:</p>
              <ul>
                <li>Social Belonging & Belonging Uncertainty</li>
                <li>Trust &amp; Fairness</li>
                <li>Institutional Growth Mindset</li>
                <li>STEM Self-Efficacy</li>
                <li>Identity Threat</li>
              </ul>
              <p>
                To understand how each construct is defined and measured, please
                refer to the{' '}
                <a href="https://docs.google.com/document/d/1I7ecMcHGYEgLvFrWWy8_osKapyzwwwAe_oFCV_g3hJE/edit#">
                  Guide to Measures for the College Student Experiences Tracker
                  (C-SET)
                </a>
                .
              </p>
              <p>
                As a reminder, to preview the full survey click{' '}
                <em>Settings</em> in the navigation bar to the left and then{' '}
                <em>Survey</em>.
              </p>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Coming Up</h2>
              <p>
                In an effort to provide relevant information just-in-time, each
                task includes brief instructions. As a preview, you can expect
                to complete the following:
              </p>
              <ul>
                <li>
                  <strong>Schedule Survey Cycles:</strong> Determine how many
                  times and how often students will be surveyed.
                </li>
                <li>
                  <strong>Set Up Your Roster:</strong> You&rsquo;ll only need a
                  list of student email addresses or student IDs that you can
                  copy and paste.
                </li>
                <li>
                  <strong>Survey Students:</strong> We provide a few tips that
                  encourage honest and thoughtful responses from students.
                </li>
                <li>
                  <strong>Receive Reports:</strong> With student feedback that
                  can be used to understand students&rsquo; experiences and find
                  ways to better support them.
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
  form: 'CSETUnderstandProgram',
})(CSETUnderstandProgram);
