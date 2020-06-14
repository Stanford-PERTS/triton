import React, { useContext, useEffect, useState } from 'react';
import { compose } from 'recompose';
import { Field, reduxForm } from 'redux-form';

import Card from 'components/Card';
import ErrorField from 'components/Form/ErrorField';
import FormActions from 'components/Form/FormActions';
import InfoBox from 'components/InfoBox';
import Show from 'components/Show';
import TermsContext from 'components/TermsContext';
import TextField from 'components/Form/TextField';
import ToggleField from 'components/Form/ToggleField';

import validate from './validate';

const TeamSettings = props => {
  const {
    dark,
    addError,
    left,
    loading,
    onSubmit,
    targetGroupEnabled, // whether the program allows this feature at all
    teamMode,
    title,
    // redux-form
    change,
    handleSubmit,
    initialValues = {},
    submit,
    invalid,
    pristine,
  } = props;
  const submittable = !invalid && !pristine && !loading;
  const { target_group_name = false } = initialValues;
  const terms = useContext(TermsContext);

  // If the target group featured is enabled by this program, users may choose
  // to activate it or not.
  const [targetGroupActive, setTargetGroupActive] = useState(
    Boolean(target_group_name),
  );

  // Update `targetGroupActive` when initialValues.target_group_name updates.
  // This is necessary because initialValues might come in empty until loading
  // has completed.
  useEffect(() => {
    setTargetGroupActive(Boolean(target_group_name));
  }, [target_group_name]);

  const handleTargetGroupToggle = event => {
    const shouldUseTargetGroup = event.target.checked;

    setTargetGroupActive(shouldUseTargetGroup);
    if (shouldUseTargetGroup) {
      // The empty string value will not pass the validator, intentionally.
      change('target_group_name', '');
    } else {
      change('target_group_name', null);
    }
  };

  const shouldShowOrganizationCodeSection = teamMode === 'add';

  const shouldShowTargetEnabledSection =
    teamMode === 'update' && targetGroupEnabled;

  return (
    <form className="TeamDetailsForm" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Card.Header dark={dark} left={left}>
          {title}
        </Card.Header>
        <Card.Content>
          <p>{terms.addNewTeamDescription}</p>
          <Field
            component={TextField}
            label="Name"
            name="name"
            placeholder=""
            type="text"
          />
        </Card.Content>

        <Show when={shouldShowOrganizationCodeSection}>
          <Card.Content>
            <p>
              If you&rsquo;d like your {terms.team.toLowerCase()} to be part of{' '}
              {terms.a.organization.toLowerCase()}, enter that{' '}
              {terms.organization.toLowerCase()}&rsquo;s invitation code here.
            </p>
            <Field
              component={TextField}
              label={`${terms.organization} Code (optional)`}
              name="organization_code"
              placeholder="code"
              type="text"
            />
            {addError && (
              <InfoBox error>
                {addError.message
                  ? addError.message
                  : 'We couldn’t find that code.'}
              </InfoBox>
            )}
          </Card.Content>
        </Show>

        <Show when={shouldShowTargetEnabledSection}>
          <Card.Content data-test="target-group-section">
            <p>
              Participants can be assigned to a <strong>Target Group</strong>.
              They&rsquo;ll appear separately on your report.
            </p>
            <ToggleField
              label="Use a target group (optional)"
              input={{
                onChange: handleTargetGroupToggle,
                value: targetGroupActive,
              }}
              disabled={loading}
            />
            {targetGroupActive && (
              <Field
                component={TextField}
                label="Target Group Name"
                name="target_group_name"
                placeholder=""
                type="text"
                maxLength="50"
              />
            )}
          </Card.Content>
        </Show>

        <Card.Content>
          <FormActions
            displayEntity={terms.team}
            mode={teamMode}
            form="team"
            handleSubmit={submit}
            submittable={submittable}
            submitting={loading}
          />
        </Card.Content>
        <Field name="_form" component={ErrorField} />
      </Card>
    </form>
  );
};

export default compose(
  reduxForm({
    form: 'team',
    enableReinitialize: true,
    validate,
  }),
)(TeamSettings);
