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

import gardenPng from 'assets/programs/beleset/garden.png';
import cycleDiagramPng from 'assets/programs/beleset/cycle_diagram.png';

const BELESETUnderstandCycles = props => {
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
          Learning Module: Understand Cycles
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
              <h2>Continuous Improvement Cycles</h2>
              <Multicolumn>
                <div>
                  <p>
                    It takes significant skill to create an equitable learning
                    environment that inspires and empowers all students to
                    learn. To master that complex skill, teachers need ongoing
                    feedback and practice. That&rsquo;s why Copilot-Elevate is
                    set up as an adaptive and continuous process, with multiple
                    cycles of inquiry, reflection, and action.
                  </p>
                  <p>
                    Each cycle should be treated as a &ldquo;safe-to-fail
                    probe&rdquo; that gives educators an opportunity to try out
                    one or more ways to create a better learning environment for
                    their students and learn from their students. Remember:
                    creating an optimal and equitable learning environment takes
                    time&mdash;it&rsquo;s like cultivating a garden, not like
                    flipping a lightswitch. Don&rsquo;t be disappointed if you
                    don&rsquo;t see results right away.
                  </p>
                </div>
                <Figure vertical small>
                  <img
                    src={gardenPng}
                    alt="vegetable garden with raised beds"
                  />
                  <figcaption>
                    Creating a supportive and equitable learning environment is
                    less like turning on a light switch, and more like growing a
                    garden. It&rsquo;s a developmental process that takes time
                    and is influenced by multiple factors.
                  </figcaption>
                </Figure>
              </Multicolumn>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Anatomy of a Cycle</h2>
              <Multicolumn>
                <div>
                  <p>Each cycle has three main components:</p>
                  <ul>
                    <li>
                      <strong>Inquiry</strong>: Use a brief survey to learn
                      about your students&rsquo; experiences in your school or
                      class.
                    </li>
                    <li>
                      <strong>Reflection</strong>: Use the{' '}
                      <strong>practice journal</strong> to reflect on your
                      survey results and leverage the{' '}
                      <Link to="https://equitablelearning.org">
                        BELE Library
                      </Link>{' '}
                      to create an action plan.
                    </li>
                    <li>
                      <strong>Action</strong>: Implement the practice changes
                      that you want to test. You&rsquo;ll see whether they
                      improved the quality or equity of students&rsquo;
                      experiences in the next cycle.
                    </li>
                  </ul>
                  <p>
                    Over multiple cycles, you can check your progress towards a
                    more supportive and equitable learning environment.
                  </p>
                </div>
                <Figure vertical small>
                  <img
                    src={cycleDiagramPng}
                    alt="A cycle consists of inquiry, reflection, and action"
                  />
                </Figure>
              </Multicolumn>
            </Card.Content>
          </Page>
        </Pages>
      </Card>
    </Form>
  );
};

export default withReduxFormForResponses({
  form: 'BELESETUnderstandCycles',
})(BELESETUnderstandCycles);
