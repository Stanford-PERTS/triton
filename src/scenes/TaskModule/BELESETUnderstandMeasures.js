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

import maleTeacherHelpingYoungFemaleStudentPng from 'assets/programs/beleset/male_teacher_helping_young_female_student.png';
import mindTheGapPng from 'assets/programs/beleset/mind_the_gap.png';
import powellJohnAPortraitPng from 'assets/programs/beleset/powell_john_a_portrait.png';

const UlMoreSpacing = styled.ul`
  li {
    padding-bottom: 10px;

    a {
      margin-right: 2px;
    }
  }
`;

const LiNoBullet = styled.li`
  list-style: none;
`;

const BELESETUnderstandMeasures = props => {
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
          Learning Module: Understand the Measures
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
                  <h2>The Copilot-Elevate Measures</h2>
                  <p>
                    Research is clear: Students are more motivated&mdash;and
                    they earn higher grades and test scores&mdash;when learning
                    takes place under certain conditions. Copilot-Elevate
                    enables teachers to easily measure these learning
                    conditions, and it provides just-in-time recommendations for
                    cultivating them.
                  </p>
                  <p>
                    You can visit the{' '}
                    <strong>
                      <Link to="https://equitablelearning.org">
                        BELE Library
                      </Link>
                    </strong>{' '}
                    by clicking the link next to each learning condition below
                    to learn the research behind its importance, as well as
                    adaptive strategies for nurturing it. In the meantime,
                    here&rsquo;s a summary.
                  </p>
                </div>
                <Figure vertical>
                  <img
                    src={maleTeacherHelpingYoungFemaleStudentPng}
                    alt="a teacher helping student with a notebook"
                  />
                  <figcaption>
                    Students are more motivated and less distracted and anxious
                    when they have a secure relationship with their teacher.
                  </figcaption>
                </Figure>
              </Multicolumn>
              <UlMoreSpacing>
                <li>
                  <strong>
                    <Link to="https://perts.net/conditions-classroom-belonging">
                      Classroom Belonging
                    </Link>
                  </strong>
                  : Students need to feel a sense of community, mutual support
                  among peers, and affirmation to feel safe and connected.
                </li>
                <LiNoBullet>
                  Example measure: This week I felt comfortable sharing my
                  thoughts and opinions in class.
                </LiNoBullet>
                <li>
                  <strong>
                    <Link to="https://perts.net/conditions-feedback-for-growth">
                      Feedback for Growth
                    </Link>
                  </strong>
                  : Students need supportive feedback that helps them recognize
                  their own potential to grow.
                </li>
                <LiNoBullet>
                  Example measure: This week in class, I got specific
                  suggestions about how to improve my skills.
                </LiNoBullet>
                <li>
                  <strong>
                    <Link to="https://perts.net/conditions-meaningful-work">
                      Meaningful Work
                    </Link>
                  </strong>
                  : Students need to understand how schoolwork is relevant to
                  their own lives and goals.
                </li>
                <LiNoBullet>
                  Example measure: This week, I learned skills in class that
                  will help me succeed later in life.
                </LiNoBullet>
                <li>
                  <strong>
                    <Link to="https://perts.net/conditions-student-voice">
                      Student Voice
                    </Link>
                  </strong>
                  : Students take ownership of their learning through sharing
                  their knowledge and perspectives in the classroom.
                </li>
                <LiNoBullet>
                  Example measure: This week, my teacher responded to student
                  suggestions to make our class better.
                </LiNoBullet>
                <li>
                  <strong>
                    <Link to="https://perts.net/conditions-teacher-caring">
                      Teacher Caring
                    </Link>
                  </strong>
                  : Students need to feel valued and respected in the learning
                  environment.
                </li>
                <LiNoBullet>
                  Example measure: I feel like my teacher is glad that I am in
                  their class.
                </LiNoBullet>
              </UlMoreSpacing>
              <p>
                To access a shareable version of this summary, please refer to{' '}
                <Link to="https://perts.net/elevate/measures-summary">
                  Copilot-Elevate: Measures Summary
                </Link>
                .
              </p>
              <p>
                As a reminder, to preview the full survey (or customize measures
                if you are the project host), click <em>Settings</em> in the
                navigation bar to the left and then <em>Survey Settings</em>.
              </p>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Why Measure Students&rsquo; Experiences?</h2>
              <Multicolumn>
                <div>
                  <p>
                    Even when educators recognize that these learning conditions
                    are important for student success&mdash;and even when
                    educators try their best to create these
                    conditions&mdash;doing so can be extremely challenging.
                  </p>

                  <p>
                    One of the main barriers is that, often, the messages
                    teachers intend to send are not the messages students
                    receive. In other words, there&rsquo;s often a big gap
                    between teachers&rsquo; intentions and students&rsquo;
                    experiences. Absent feedback from students, it can be hard
                    to recognize or close that gap.
                  </p>

                  <p>
                    Copilot-Elevate makes it easy for teachers to collect that
                    student feedback using validated measures. It also provides
                    for confidentiality so that students are comfortable being
                    honest.
                  </p>
                </div>
                <Figure vertical small>
                  <img src={mindTheGapPng} alt="Sign reading 'Mind The Gap'" />
                  <figcaption>
                    Often, there&rsquo;s a big gap between teachers&rsquo;
                    intentions and the experiences students have in their
                    classroom. It&rsquo;s impossible to know if you have that
                    gap until you ask students.
                  </figcaption>
                </Figure>
              </Multicolumn>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Equitable Conditions & The Target Group Feature</h2>
              <Multicolumn>
                <div>
                  <p>
                    In many schools, specific groups of students are situated
                    further from opportunity. Often, these students are members
                    of a particular racial, ethnic, or gender group; English
                    language learners; or students who are members of multiple,
                    intersecting demographics (for example, boys of color).
                  </p>
                  <p>
                    If a particular group of students is least-well served in
                    your school or classroom, it can be helpful to pay special
                    attention to how members of that group are experiencing the
                    learning environment. In order to support such targeted
                    inquiry, Copilot-Elevate has an optional{' '}
                    <strong>target group</strong> feature. The next page
                    explains how to use it.
                  </p>
                </div>
                <Figure vertical small>
                  <img
                    src={powellJohnAPortraitPng}
                    alt="Portait of john a. powell"
                  />
                  {/*
                    Note: Professor powell intentionally does not capitalize
                    his name.
                  */}
                  <figcaption>
                    john a. powell of UC Berkeley&rsquo;s Othering & Belonging
                    Institute is a leading proponent of Targeted Universalism.
                  </figcaption>
                </Figure>
              </Multicolumn>
            </Card.Content>
          </Page>
          <Page>
            <Card.Content>
              <h2>Setting a Target Group</h2>
              <p>
                When a <strong>target group</strong> is set, reports will
                display results separately for students in the target group and
                for those who are not. In this way, project members can
                recognize how students&rsquo; experiences in their own class(es)
                may be reinforcing or mitigating opportunity gaps.
              </p>
              <p>
                A <strong>target group</strong> is set at the project level and
                only one target group can be set at a time for any given
                project, but the <strong>host</strong> can set or change the
                project&rsquo;s target group at any point. To use the target
                group feature:
              </p>
              <ol>
                <li>
                  The <strong>host</strong> must activate the feature in{' '}
                  <em>Settings</em> and name the group.
                </li>
                <li>
                  Students must be assigned to the target group in{' '}
                  <strong>roster</strong> setup.
                </li>
                <li>
                  Students who are assigned to the target group in any project{' '}
                  <strong>roster</strong> will belong to the target group across
                  all rosters in that project.
                </li>
              </ol>
            </Card.Content>
          </Page>
        </Pages>
      </Card>
    </Form>
  );
};

export default withReduxFormForResponses({
  form: 'BELESETUnderstandMeasures',
})(BELESETUnderstandMeasures);
