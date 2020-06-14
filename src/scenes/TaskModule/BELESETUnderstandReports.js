import React from 'react';

import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import Figure from 'components/Figure';
import Form from 'components/Form';
import Link from 'components/Link';
import Multicolumn from 'components/Multicolumn';
import Page from 'programs/Page';
import Pages from 'programs/Pages';

import growthLetterBlocksPng from 'assets/programs/beleset/growth_letter_blocks.png';

const BELESETUnderstandReports = props => {
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
          Learning Module: Understand Reports
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
              <h2>The Purpose of Copilot Reports</h2>
              <Multicolumn>
                <div>
                  <p>
                    Copilot <strong>reports</strong> provide ongoing, formative
                    feedback that helps educators understand and improve the
                    learning conditions in their classrooms. The report results
                    are intended to{' '}
                    <strong>support systematic improvement</strong>, and they
                    are <strong>not valid for accountability</strong> purposes.
                    We&rsquo;ll explain more about that distinction and why it
                    is important on the next page.
                  </p>
                  <p>
                    First, what <em>should</em> the reports be used for? The
                    results can help you recognize:
                  </p>
                </div>
                <Figure vertical small>
                  <img
                    src={growthLetterBlocksPng}
                    alt="'growth' spelled with blocks"
                  />
                  <figcaption>
                    Copilot reports support improvement by providing insightful,
                    actionable information based on students&rsquo; experiences.
                  </figcaption>
                </Figure>
              </Multicolumn>
              <ul>
                <li>
                  What learning conditions are <em>already present</em> in your
                  class. Keep doing what you&rsquo;re doing along those
                  dimensions.
                </li>
                <li>
                  What learning conditions are absent for large numbers of
                  students and/or specific groups of students. When you see an
                  opportunity to improve, consult the{' '}
                  <em>See Recommendations</em> link in your report to learn what
                  best practices you could leverage to improve that learning
                  condition.
                </li>
                <li>
                  Whether changes you&rsquo;re making are improving student
                  experience. As you test out new strategies, you should see
                  students&rsquo; ratings of the learning conditions improve
                  over time. But remember, it can take time&mdash;like
                  cultivating a garden.
                </li>
              </ul>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Measurement for Improvement vs. Accountability</h2>
              <p>
                <strong>Copilot</strong> reports are designed to help teachers
                learn how to support their students more effectively. They
                should not be used to evaluate or compare between teachers.
              </p>
              <p>
                Evaluating teachers based on their learning condition data would
                be inappropriate and unfair because students enter the classroom
                with mindsets and expectations that have been colored by their
                prior experiences. For example, students who have been
                mistreated by their teachers in the past may come into a new
                classroom expecting their new teacher to also treat them poorly.
                That expectation could lead them to rate their experiences more
                negatively than they otherwise would.
              </p>
              <p>
                In other words, it takes more work and patience to develop a
                supportive relationship with a student who has been scarred by
                their previous experiences. It would be unfair to penalize a
                teacher for their students&rsquo; previous experiences, but it
                would also be unfair to that student not to work hard to build
                more positive experiences that will inspire them to engage and
                learn.
              </p>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Reports: The Basics</h2>
              <p>
                New reports are generated every weekend after your students
                complete the survey. They are designed to be thorough and easily
                digestible. They include:
              </p>
              <ul>
                <li>
                  <strong>Communication Summary</strong>: student responses to
                  questions that can help you understand if students felt
                  comfortable responding to the survey honestly and if they
                  understood their feedback could be used to improve their
                  learning conditions.
                </li>
                <li>
                  <strong>Participation Summary</strong>: shows what percent of
                  students participated in each cycle.
                </li>
                <li>
                  <strong>Progress on each learning condition over time</strong>
                  : with data points reflecting responses from every cycle.
                </li>
                <li>
                  <strong>Data disaggregated by</strong>:
                </li>
                <ul>
                  <li>
                    Gender - based on students&rsquo; self identification.
                  </li>
                  <li>
                    Structural Advantage &amp; Disadvantage - based on
                    students&rsquo; self identification of race/ethnicity.
                  </li>
                  <li>Target Group - if one has been set.</li>
                </ul>
                <li>
                  <strong>
                    Links to relevant{' '}
                    <Link to="https://equitablelearning.org">BELE Library</Link>{' '}
                    resources
                  </strong>
                </li>
              </ul>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Reports: Debrief the Results with Students</h2>
              <p>
                In order to get honest and authentic feedback from your students
                consistently, they need to trust their responses will contribute
                to improved learning conditions. Intentionally debriefing your
                report reflections and intended action with students can
                contribute to cultivating that trust&mdash;it demonstrates to
                students that you value their voice and care about their
                experiences in your class.
              </p>
              <p>
                Here are a few suggestions to engage students in this type of
                dialogue.
              </p>
              <ul>
                <li>
                  Demonstrate to your students that you&rsquo;re listening by
                  sharing back what you learned.
                </li>
                <li>
                  Share with them where you&rsquo;re doing well and what
                  you&rsquo;re working to improve based on the feedback you
                  received.
                </li>
                <li>
                  Dig deeper with students through class discussions or
                  interviews.
                </li>
                <li>
                  Of course, you don&rsquo;t have to share the actual reports or
                  even specific figures with students.
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
  form: 'BELESETUnderstandReports',
})(BELESETUnderstandReports);
