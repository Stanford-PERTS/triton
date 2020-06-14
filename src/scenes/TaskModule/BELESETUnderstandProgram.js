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
import hostTaskLabelPng from 'assets/programs/beleset/host_task_label.png';
import navBarScreenshotPng from 'assets/programs/beleset/nav_bar_screenshot.png';

const IndicatorColumnOne = styled.td`
  min-width: 100px;
  padding: 5px 20px 5px 0;
  /*text-align: right;*/
  text-align: center;
`;

const IndicatorColumnTwo = styled.td``;

const BELESETUnderstandProgram = props => {
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
          Learning Module: Understand Copilot-Elevate
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
                  <h2>What is Copilot-Elevate?</h2>
                  <p>
                    Copilot is a unique professional learning platform that
                    helps teachers improve the quality and equity of the
                    learning conditions in their classrooms.{' '}
                    <strong>Copilot-Elevate</strong> is the latest version of
                    Copilot, designed by PERTS in partnership with the National
                    Equity Project, Shift Results, and the University of Chicago
                    Consortium for School Research.
                  </p>
                  <p>
                    Learning experiences matter and we have designed
                    Copilot-Elevate to provide you with an intuitive, seamless,
                    and flexible experience. Where we felt you might need
                    additional information or context, we created a brief
                    learning module, like this one. Completing this module will
                    take about 3 minutes and it will introduce you to:
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
              <ul>
                <li>the Copilot user interface; </li>
                <li>project roles; and </li>
                <li>a preview of upcoming learning modules.</li>
              </ul>
              <p>
                Click the <em>Next</em> button to go to the next page.
              </p>
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
                    progress through Elevate. The{' '}
                    <strong>navigation bar</strong> on the left provides
                    shortcuts to key features and options that are otherwise
                    part of the scaffolded experience in <strong>Stages</strong>
                    .
                  </p>
                  <ul>
                    <li>
                      <strong>Settings</strong> enables you to invite project
                      members, preview your survey, and customize your survey
                      and reports if you&rsquo;re a project host.
                    </li>
                    <li>
                      <strong>Rosters</strong> enables you to update or create
                      new rosters at any time.
                    </li>
                    <li>
                      <strong>Reports</strong> provides access to the student
                      feedback reports that are generated each time you survey
                      students.
                    </li>
                    <li>
                      <strong>Documents</strong> provides a collection of direct
                      links to useful reference materials.
                    </li>
                    <li>
                      Most importantly, <strong>Stages</strong> walks you
                      through all of the steps involved in implementing
                      Copilot-Elevate so that you can elevate student voice,
                      student experience, and student learning.
                    </li>
                  </ul>
                </div>
              </Multicolumn>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>The Copilot User Interface: Stages</h2>
              <p>
                Each stage has a list of scaffolded tasks that can be completed
                in sequence. While we hope our design is intuitive, there are a
                few items we&rsquo;d like you to notice:
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
                        src={hostTaskLabelPng}
                        alt="label for when a host is responsible for a task"
                      />
                    </IndicatorColumnOne>
                    <IndicatorColumnTwo>
                      indicates tasks that are completed or can be edited by the
                      project host (more on that next)
                    </IndicatorColumnTwo>
                  </tr>
                </tbody>
              </table>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Project Roles</h2>
              <p>
                Project roles are determined by the way in which a user enters
                Copilot-Elevate. Hosts and members share many similarities and
                move through Copilot-Elevate similarly, however, there are a few
                critical distinctions.
              </p>
              <p>
                <strong>Hosts</strong> generally:
              </p>
              <ul>
                <li>
                  generate their own invitation and create a project upon
                  logging in.
                </li>
                <li>
                  take on a few administrative setup tasks, like customizing the
                  survey as needed and setting survey window dates
                </li>
              </ul>
              <p>
                As the name suggests, <strong>hosts</strong> can also invite
                others into a shared project as <strong>members</strong>. In
                those instances, hosts may:
              </p>
              <ul>
                <li>
                  create <strong>rosters</strong> for members so that they can
                  dive into collecting student feedback
                </li>
                <li>
                  view <strong>progress bars</strong> that provide insight into
                  how members are progressing through various tasks
                </li>
              </ul>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Coming Up</h2>
              <p>
                In an effort to provide relevant information just-in-time,
                upcoming modules will cover:
              </p>
              <ul>
                <li>
                  <strong>Measures</strong>: What learning conditions can you
                  measure with Copilot-Elevate and why do they matter? Spoiler:
                  They support academic success and social and emotional
                  development, and they have disproportionate benefits for the
                  students positioned furthest from opportunity.
                </li>
                <li>
                  <strong>Cycles</strong>: Why is student feedback collected
                  over multiple, iterative cycles? Spoiler: It takes practice
                  and iteration to improve the quality and equity of a learning
                  environment&mdash;to master that complex skill, teachers need
                  ongoing feedback and practice.
                </li>
                <li>
                  <strong>Surveys</strong>: How do you prepare students to
                  complete the survey? Spoiler: Message to students that their
                  responses can influence their learning experience and
                  you&rsquo;re more likely to get honest and thoughtful
                  responses.
                </li>
                <li>
                  <strong>Reports</strong>: How should you interpret student
                  feedback on Copilot reports? Spoiler: Use it to understand
                  students&rsquo; experiences and to find ways to better support
                  your students. Don&rsquo;t use it for comparing between
                  teachers&mdash;the measures are not valid for between teacher
                  comparisons.
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
  form: 'BELESETUnderstandProgram',
})(BELESETUnderstandProgram);
