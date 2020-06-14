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
import HiddenField from 'components/Form/HiddenField';
import RadioField from 'components/Form/RadioField';
import TextField from 'components/Form/TextField';

const DemoSinglePageModule = props => {
  const {
    isCaptain,
    toBack,
    user,
    // redux-form
    form,
    handleSubmit,
    invalid,
    submitting,
  } = props;

  const sceneTitle = isCaptain
    ? 'Team Captain Implementation Agreement'
    : 'Teacher Implementation Agreement';

  return (
    <>
      <Section dark title={sceneTitle} left={<BackButton to={toBack} />}>
        <Form>
          <Card.Content>
            <Show when={isCaptain}>
              <p>
                Please read the{' '}
                <Link to="https://perts.net/engage/implementation-agreement">
                  Engagement Project Implementation Agreement
                </Link>{' '}
                and review it with your project sponsor and the teachers on your
                team. The captain, sponsor, and teacher roles are described in
                detail in the Implementation Agreement.
              </p>
            </Show>

            <Show when={!isCaptain}>
              <p>Dear {user.name},</p>
              <p>
                Read and review the{' '}
                <Link to="https://perts.net/engage/implementation-agreement">
                  Engagement Project Implementation Agreement
                </Link>{' '}
                with your project sponsor.
              </p>
            </Show>
          </Card.Content>

          <Card.Content>
            <p>
              Please sign below to affirm you have read and agree to the
              responsibilities described in the Implementation Agreement.
            </p>
            <Field
              name="signature"
              component={TextField}
              label="Signature"
              placeholder="Enter your name here"
              required
            />
          </Card.Content>

          <Show when={isCaptain}>
            <Card.Content>
              <p>
                What is your <strong>project sponsor&rsquo;s</strong> name and
                title?
              </p>
              <Field
                name="supervisor_info"
                component={TextField}
                label="Sponsor's name and title"
                placeholder="Enter your sponsor's name and title here"
                required
              />
            </Card.Content>
            <Card.Content>
              <p>
                Has the project sponsor reviewed and agreed, in writing, to
                their responsibilities as laid out in the Implementation
                Agreement?
              </p>
              <Field
                name="supervisor_agreement"
                options={{
                  yes: 'Yes',
                  no: 'No',
                }}
                component={RadioField}
                label="Has the project sponsor reviewed and agreed?"
                wide
                required
              />
            </Card.Content>
          </Show>

          <HiddenField name="is_captain" component="input" parse={Boolean} />

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

          <FormSubmitFailed form={form} handleSubmit={handleSubmit}>
            {/* Using the error provided by redux-form-saga */}
          </FormSubmitFailed>
        </Form>
      </Section>
    </>
  );
};

DemoSinglePageModule.defaultProps = {
  user: {},
};

const mapStateToProps = (state, props) => ({
  initialValues: { is_captain: props.isCaptain },
});

export default compose(
  connect(mapStateToProps),
  withReduxFormForResponses({
    form: 'DemoSinglePageModule',
  }),
)(DemoSinglePageModule);
