import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import Section from 'components/Section';
import Show from 'components/Show';

import Form from 'components/Form';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import RadioField from 'components/Form/RadioField';
import TextArea from 'components/Form/TextArea';
import { RadioAxis, RadioAxisLabel } from 'components/Form/RadioAxis';

const EPExitSurvey = props => {
  const {
    isCaptain,
    toBack,
    // redux-form
    form,
    handleSubmit,
    invalid,
    submitting,
  } = props;

  return (
    <Section dark title="Exit Survey" left={<BackButton to={toBack} />}>
      <Form>
        <Card.Content>
          <p>
            <em>Feedback helps everyone grow&mdash;us included!</em>
          </p>
          <p>
            Thank you for taking the time to answer these questions and share
            your thoughts. We hope to use your answers to make the Engagement
            Project better for teachers like you next year.
          </p>
        </Card.Content>
        <Card.Content>
          <p>What drew you to participate in the Engagement Project?</p>
          <Field
            name="why_participate"
            options={{
              volunteered: <span>I volunteered to participate</span>,
              invited: <span>I was asked to participate</span>,
              mandatory: <span>Participation was mandatory</span>,
            }}
            component={RadioField}
            column
            required
          />
        </Card.Content>
        <Card.Content>
          <p>
            Do you think that you made any meaningful improvements to your
            teaching practice through your participation in the Engagement
            Project?
          </p>
          <Field
            name="improved_practice"
            options={{
              yes: <span>Yes</span>,
              no: <span>No</span>,
            }}
            component={RadioField}
            wide
            required
          />
        </Card.Content>
        <Card.Content>
          <p>
            How likely are you to recommend the Engagement Project to
            colleagues?
          </p>
          <RadioAxis>
            <RadioAxisLabel start>Not at all likely</RadioAxisLabel>
            <RadioAxisLabel end>Extremely likely</RadioAxisLabel>
          </RadioAxis>
          <Field
            component={RadioField}
            options={{
              '1': '1',
              '2': '2',
              '3': '3',
              '4': '4',
              '5': '5',
              '6': '6',
              '7': '7',
              '8': '8',
              '9': '9',
              '10': '10',
            }}
            name="recommend"
            wide
            required
          />
        </Card.Content>

        <Card.Content>
          <p>In two or more sentences, please tell us a bit more about</p>
          <ul>
            <li>
              the changes that you made to your practice as a result of the
              Engagement Project AND
            </li>
            <li>the changes that you saw in your classes as a result</li>
          </ul>
          <Field
            name="changes_and_results"
            component={TextArea}
            type="text"
            required
          />
        </Card.Content>
        <Card.Content>
          <p>
            How could we improve the Engagement Project for next year? We read
            every response and take your detailed feedback very seriously.
            Consider:
          </p>
          <ul>
            <li>The survey questions</li>
            <li>The reports</li>
            <li>The Copilot interface</li>
            <li>The strategy library</li>
            <li>The team meeting guides</li>
            <li>Anything else that was part of your experience</li>
          </ul>
          <Field
            name="improve_ep"
            component={TextArea}
            type="textarea"
            required
          />
        </Card.Content>
        <Show when={isCaptain}>
          <Card.Content>
            <p>
              How easy or difficult was it for you as Team Captain to lead your
              team through registration, launch, and Cycle Meetings?
            </p>
            <Field
              name="captain_difficulty"
              component={RadioField}
              options={{
                '1': (
                  <span>
                    Extremely
                    <br />
                    easy
                  </span>
                ),
                '2': (
                  <span>
                    Moderately
                    <br />
                    easy
                  </span>
                ),
                '3': (
                  <span>
                    Slightly
                    <br />
                    easy
                  </span>
                ),
                '4': (
                  <span>
                    Neither easy
                    <br />
                    nor difficult
                  </span>
                ),
                '5': (
                  <span>
                    Slightly
                    <br />
                    difficult
                  </span>
                ),
                '6': (
                  <span>
                    Moderately
                    <br />
                    difficult
                  </span>
                ),
                '7': (
                  <span>
                    Extremely
                    <br />
                    difficult
                  </span>
                ),
              }}
              wide
            />
          </Card.Content>

          <Card.Content>
            <p>
              How would you describe the biggest challenge for you as a Team
              Captain, and how would you recommend that we help address this
              challenge for teachers like you in the future? Again, we read
              every response and take your detailed feedback very seriously.
            </p>
            <Field name="captain_challenge" component={TextArea} type="text" />
          </Card.Content>
        </Show>

        <Card.Content>
          <p>Do you plan to keep using the Engagement Project next year?</p>
          <Field
            name="use_ep_next_year"
            options={{
              yes: <span>Yes</span>,
              no: <span>No</span>,
            }}
            component={RadioField}
            wide
            required
          />
        </Card.Content>

        <Card.Content>
          <p>
            Would you like to see the Engagement Project expand at your school?
          </p>
          <Field
            name="expand_ep"
            options={{
              yes: <span>Yes</span>,
              no: <span>No</span>,
            }}
            component={RadioField}
            wide
            required
          />
        </Card.Content>

        <FormSubmitButton
          disabled={invalid}
          handleSubmit={handleSubmit}
          submitting={submitting}
          submittingText="Submitting"
          data-test="submit"
        >
          Save
        </FormSubmitButton>

        <FormSubmitSucceeded form={form} timeout={Infinity}>
          <InfoBox success>
            <span>
              Response saved. <Link to={toBack}>Return to task list.</Link>
            </span>
          </InfoBox>
        </FormSubmitSucceeded>

        <FormSubmitFailed form={form}>
          {/* Using the error provided by redux-form-saga */}
        </FormSubmitFailed>
      </Form>
    </Section>
  );
};

EPExitSurvey.defaultProps = {
  user: {},
};

const mapStateToProps = (state, props) => ({
  initialValues: { is_captain: props.isCaptain },
});

export default compose(
  connect(mapStateToProps),
  withReduxFormForResponses({
    form: 'EPExitSurvey',
  }),
)(EPExitSurvey);
